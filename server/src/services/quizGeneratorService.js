const GeminiService = require('./geminiService');
const QuizValidatorService = require('./quizValidatorService');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Quiz Generator Service
 * Uses Google Gemini to generate high-pedagogy, structured multiplayer quizzes
 * with automated schema validation and single-question self-healing repair.
 */
const QuizGeneratorService = {
  /**
   * Generate a complete quiz.
   * @param {object} params - Generation parameters
   * @returns {Promise<{ quiz: object, validationReport: object }>}
   */
  async generateQuiz({
    topic,
    learningObjectives = '',
    educationalLevel = 'Undergraduate',
    questionCount = 5,
    difficulty = 'medium',
    questionTypes = ['MCQ', 'TRUE_FALSE', 'MULTI_SELECT', 'SCENARIO'],
    timeLimit = 30,
    additionalInstructions = '',
  }) {
    logger.info(`Generating AI Quiz for topic: "${topic}", count: ${questionCount}, difficulty: ${difficulty}`);

    const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 1), 25);
    const types = Array.isArray(questionTypes) && questionTypes.length > 0 ? questionTypes : ['MCQ'];

    const prompt = `
You are an expert curriculum designer, educator, and assessment specialist.
Generate an engaging, competitive multiplayer classroom quiz in strict JSON format.

QUIZ CONFIGURATION:
- Topic: "${topic}"
- Target Learning Objectives: "${learningObjectives || 'Mastery of fundamental and advanced concepts in ' + topic}"
- Educational Level: "${educationalLevel}"
- Question Count: ${count}
- Target Difficulty: "${difficulty}" (Provide a balanced distribution across levels 1 to 5)
- Allowed Question Types: ${JSON.stringify(types)}
- Default Time Limit: ${timeLimit} seconds per question
- Additional Instructions: "${additionalInstructions || 'Ensure questions are unambiguous, educational, and challenging.'}"

DIFFICULTY TAXONOMY (Assign each question difficulty 1 to 5):
1 - Recall / Fact
2 - Conceptual Understanding
3 - Real-world Application
4 - Analysis & Problem Solving
5 - Master Challenge / Synthesis

SUPPORTED QUESTION FORMATS:
1. MCQ:
   "type": "MCQ"
   "prompt": "...",
   "options": ["Option A", "Option B", "Option C", "Option D"],
   "correct_answer": "Option B" (exact string matching one of the options)
2. TRUE_FALSE:
   "type": "TRUE_FALSE"
   "prompt": "...",
   "options": ["True", "False"],
   "correct_answer": "True" or "False"
3. MULTI_SELECT:
   "type": "MULTI_SELECT"
   "prompt": "...",
   "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
   "correct_answer": ["Option 1", "Option 3"] (array of correct option strings)
4. ORDERING:
   "type": "ORDERING"
   "prompt": "Arrange the following in chronological or procedural order:",
   "options": ["Step 3", "Step 1", "Step 2"], (shuffled)
   "correct_answer": ["Step 1", "Step 2", "Step 3"] (correctly ordered array)
5. MATCHING:
   "type": "MATCHING"
   "prompt": "Match the following items:",
   "options": ["Item A", "Item B", "Item C"],
   "correct_answer": [
     {"left": "Item A", "right": "Definition A"},
     {"left": "Item B", "right": "Definition B"}
   ]
6. FILL_BLANK:
   "type": "FILL_BLANK"
   "prompt": "Fill in the blank: The powerhouse of the cell is the _____.",
   "options": [],
   "correct_answer": "mitochondria"
7. SCENARIO:
   "type": "SCENARIO"
   "prompt": "Scenario: You are debugging a distributed system... What is the best strategy?",
   "options": ["Option A", "Option B", "Option C", "Option D"],
   "correct_answer": "Option A"
8. IMAGE_BASED:
   "type": "IMAGE_BASED"
   "prompt": "Identify the component shown in this system diagram...",
   "options": ["Option A", "Option B", "Option C", "Option D"],
   "correct_answer": "Option A",
   "media_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop"

JSON SCHEMA TO RETURN (Strict JSON only, no markdown wrapping, no extra keys):
{
  "title": "Engaging title for the quiz",
  "description": "Short 1-2 sentence description of the assessment",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "uuid-or-unique-string",
      "type": "MCQ",
      "prompt": "Question prompt text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_answer": "Option 1",
      "explanation": "Clear educational explanation of why this answer is correct",
      "difficulty": 2,
      "points": 100,
      "time_limit": ${timeLimit},
      "learning_objective": "Learning objective this question tests",
      "tags": ["tag1", "tag2"]
    }
  ]
}
`.trim();

    let rawResult;
    try {
      rawResult = await GeminiService.generateJSON(prompt);
    } catch (err) {
      logger.error('Gemini generation failed:', err.message);
      throw new Error(`AI generation error: ${err.message}`);
    }

    // Step 2: Validate the generated quiz
    let validation = QuizValidatorService.validateQuiz(rawResult);

    // Step 3: Self-healing repair for any invalid question
    if (!validation.isValid && validation.sanitizedQuiz?.questions) {
      logger.warn('AI quiz had validation issues, running single-question repair...', validation.errors);
      const repairedQuestions = [...validation.sanitizedQuiz.questions];

      for (const [idxStr, errs] of Object.entries(validation.questionErrors)) {
        const idx = parseInt(idxStr, 10);
        logger.info(`Attempting targeted repair for question #${idx + 1}...`);
        try {
          const repaired = await this.regenerateSingleQuestion({
            topic,
            questionIndex: idx,
            originalErrors: errs,
            preferredType: types[idx % types.length],
            difficultyLevel: Math.min(Math.max((idx % 5) + 1, 1), 5),
            learningObjective: learningObjectives,
          });
          if (repaired) {
            repairedQuestions[idx] = repaired;
          }
        } catch (repairErr) {
          logger.warn(`Single-question repair failed for #${idx + 1}: ${repairErr.message}`);
        }
      }

      validation.sanitizedQuiz.questions = repairedQuestions;
      // Re-validate after repair
      validation = QuizValidatorService.validateQuiz(validation.sanitizedQuiz);
    }

    return {
      quiz: validation.sanitizedQuiz,
      validationReport: {
        isValid: validation.isValid,
        errors: validation.errors,
      },
    };
  },

  /**
   * Regenerate a single invalid question rather than the entire quiz.
   */
  async regenerateSingleQuestion({
    topic,
    questionIndex = 0,
    originalErrors = [],
    preferredType = 'MCQ',
    difficultyLevel = 2,
    learningObjective = '',
  }) {
    const prompt = `
You are an assessment specialist. Generate ONE valid question for a multiplayer quiz on topic "${topic}".
Previous attempt had these errors: ${JSON.stringify(originalErrors)}.

REQUIREMENTS:
- Type: ${preferredType}
- Difficulty Level: ${difficultyLevel} (1=Recall, 2=Understanding, 3=Application, 4=Analysis, 5=Challenge)
- Learning Objective: ${learningObjective || 'Core knowledge of ' + topic}

Return ONLY a strict JSON object:
{
  "id": "${crypto.randomUUID()}",
  "type": "${preferredType}",
  "prompt": "Clear, precise question prompt",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": "Option A",
  "explanation": "Detailed explanation of correct answer",
  "difficulty": ${difficultyLevel},
  "points": 100,
  "time_limit": 30,
  "learning_objective": "${learningObjective || 'Mastery of ' + topic}",
  "tags": ["${topic}"]
}
`.trim();

    try {
      const result = await GeminiService.generateJSON(prompt);
      const { valid, sanitizedQuestion } = QuizValidatorService.validateQuestion(result, questionIndex, topic);
      return valid ? sanitizedQuestion : null;
    } catch (err) {
      logger.error('Failed to regenerate single question:', err.message);
      return null;
    }
  },
};

module.exports = QuizGeneratorService;
