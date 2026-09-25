const crypto = require('crypto');

const VALID_TYPES = [
  'MCQ',
  'TRUE_FALSE',
  'MULTI_SELECT',
  'MATCHING',
  'ORDERING',
  'FILL_BLANK',
  'SCENARIO',
  'IMAGE_BASED',
];

/**
 * Quiz Validator Service
 * Performs strict validation on AI-generated questions to ensure schema correctness,
 * consistency, non-duplication, and pedagogical clarity.
 */
const QuizValidatorService = {
  /**
   * Validate a single question.
   * @param {object} q - The question object
   * @param {number} index - Index in quiz
   * @param {string} targetTopic - Quiz topic
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateQuestion(q, index = 0, targetTopic = '') {
    const errors = [];

    if (!q || typeof q !== 'object') {
      return { valid: false, errors: ['Question is not an object'] };
    }

    // 1. Prompt check
    if (!q.prompt || typeof q.prompt !== 'string' || q.prompt.trim().length < 8) {
      errors.push(`Question #${index + 1} has missing or too short prompt.`);
    }

    // 2. Type check
    const type = (q.type || 'MCQ').toUpperCase();
    if (!VALID_TYPES.includes(type)) {
      errors.push(`Question #${index + 1} has unsupported type: "${q.type}". Valid types are: ${VALID_TYPES.join(', ')}.`);
    }

    // 3. Difficulty check (1 to 5)
    let difficulty = parseInt(q.difficulty, 10);
    if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
      // Default to 2 if missing/invalid
      q.difficulty = 2;
    } else {
      q.difficulty = difficulty;
    }

    // 4. Points & Time limit
    q.points = parseInt(q.points, 10) || 100;
    q.time_limit = parseInt(q.time_limit || q.timeLimit, 10) || 30;
    if (q.time_limit < 5) q.time_limit = 10;
    if (q.time_limit > 180) q.time_limit = 180;

    // 5. Type-specific answer & options consistency
    if (type === 'MCQ' || type === 'SCENARIO' || type === 'IMAGE_BASED') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`Question #${index + 1} (${type}) requires at least 2 options.`);
      } else {
        // Ensure options are strings
        q.options = q.options.map((opt) => String(opt).trim());

        // Check correct_answer
        if (q.correct_answer === undefined || q.correct_answer === null) {
          errors.push(`Question #${index + 1} is missing a correct answer.`);
        } else {
          // If correct_answer is an index (0, 1, 2)
          if (typeof q.correct_answer === 'number' && q.options[q.correct_answer] !== undefined) {
            q.correct_answer = q.options[q.correct_answer];
          }

          const correctStr = String(q.correct_answer).trim();
          const match = q.options.find((opt) => opt.toLowerCase() === correctStr.toLowerCase());
          if (!match) {
            errors.push(`Question #${index + 1} correct answer "${correctStr}" does not match any provided option.`);
          } else {
            q.correct_answer = match; // Normalize to exact option casing
          }
        }
      }
    } else if (type === 'TRUE_FALSE') {
      q.options = ['True', 'False'];
      const rawAns = String(q.correct_answer || '').trim().toLowerCase();
      if (rawAns === 'true' || rawAns === 't' || rawAns === 'yes') {
        q.correct_answer = 'True';
      } else if (rawAns === 'false' || rawAns === 'f' || rawAns === 'no') {
        q.correct_answer = 'False';
      } else {
        errors.push(`Question #${index + 1} True/False question must have correct answer of "True" or "False".`);
      }
    } else if (type === 'MULTI_SELECT') {
      if (!Array.isArray(q.options) || q.options.length < 3) {
        errors.push(`Question #${index + 1} (MULTI_SELECT) requires at least 3 options.`);
      }
      if (!Array.isArray(q.correct_answer) || q.correct_answer.length === 0) {
        errors.push(`Question #${index + 1} (MULTI_SELECT) correct answer must be an array of at least 1 option.`);
      } else {
        const optionStrings = (q.options || []).map((o) => String(o).trim().toLowerCase());
        const validAnswers = q.correct_answer.filter((ans) => optionStrings.includes(String(ans).trim().toLowerCase()));
        if (validAnswers.length === 0) {
          errors.push(`Question #${index + 1} (MULTI_SELECT) none of the correct answers matched the options.`);
        }
      }
    } else if (type === 'ORDERING') {
      if (!Array.isArray(q.options) || q.options.length < 3) {
        errors.push(`Question #${index + 1} (ORDERING) requires at least 3 items to order.`);
      }
      if (!Array.isArray(q.correct_answer) || q.correct_answer.length !== (q.options || []).length) {
        // If correct_answer missing, options might already be in correct order
        if (Array.isArray(q.options) && q.options.length >= 3) {
          q.correct_answer = [...q.options];
        } else {
          errors.push(`Question #${index + 1} (ORDERING) requires complete correct ordered array.`);
        }
      }
    } else if (type === 'MATCHING') {
      // Options should be list of left items, correct_answer should be array of { left, right } or pairs
      if (Array.isArray(q.pairs)) {
        q.correct_answer = q.pairs;
        q.options = q.pairs.map((p) => p.left);
      } else if (!Array.isArray(q.correct_answer) || q.correct_answer.length < 2) {
        errors.push(`Question #${index + 1} (MATCHING) requires at least 2 pairs in correct_answer.`);
      }
    } else if (type === 'FILL_BLANK') {
      if (!q.correct_answer || (Array.isArray(q.correct_answer) && q.correct_answer.length === 0)) {
        errors.push(`Question #${index + 1} (FILL_BLANK) requires a correct answer.`);
      }
    }

    // 6. Explanation
    if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length < 5) {
      q.explanation = `The correct answer is ${JSON.stringify(q.correct_answer)}.`;
    }

    // 7. Ensure ID exists
    if (!q.id) {
      q.id = crypto.randomUUID();
    }

    // 8. Learning objective
    if (!q.learning_objective && !q.learningObjective) {
      q.learning_objective = `Understand core concepts of ${targetTopic || 'this subject'}.`;
    } else {
      q.learning_objective = q.learning_objective || q.learningObjective;
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedQuestion: q,
    };
  },

  /**
   * Detect duplicate or near-duplicate questions.
   * @param {Array} questions
   * @returns {number[]} Indices of duplicate questions
   */
  findDuplicates(questions) {
    const duplicates = [];
    const normalizedPrompts = questions.map((q) =>
      (q.prompt || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .join(' ')
    );

    for (let i = 0; i < normalizedPrompts.length; i++) {
      for (let j = i + 1; j < normalizedPrompts.length; j++) {
        if (normalizedPrompts[i] && normalizedPrompts[i] === normalizedPrompts[j]) {
          duplicates.push(j);
        }
      }
    }
    return [...new Set(duplicates)];
  },

  /**
   * Validate an entire quiz dataset.
   * @param {object} quizData - { title, topic, questions: [...] }
   * @returns {{ isValid: boolean, errors: string[], questionErrors: Record<number, string[]>, sanitizedQuiz: object }}
   */
  validateQuiz(quizData) {
    const allErrors = [];
    const questionErrors = {};

    if (!quizData || typeof quizData !== 'object') {
      return { isValid: false, errors: ['Quiz payload must be an object'], questionErrors: {}, sanitizedQuiz: null };
    }

    const title = (quizData.title || '').trim();
    if (!title) {
      allErrors.push('Quiz title is required.');
    }

    const topic = (quizData.topic || quizData.subject || 'General Knowledge').trim();
    const rawQuestions = Array.isArray(quizData.questions) ? quizData.questions : [];

    if (rawQuestions.length === 0) {
      allErrors.push('Quiz must contain at least one question.');
    }

    const sanitizedQuestions = [];

    // Validate each question
    rawQuestions.forEach((q, idx) => {
      const { valid, errors, sanitizedQuestion } = this.validateQuestion(q, idx, topic);
      if (!valid) {
        questionErrors[idx] = errors;
        allErrors.push(...errors);
      }
      sanitizedQuestions.push(sanitizedQuestion || q);
    });

    // Check duplicates
    const duplicateIndices = this.findDuplicates(sanitizedQuestions);
    duplicateIndices.forEach((dupIdx) => {
      const err = `Question #${dupIdx + 1} appears to be a duplicate of an earlier question.`;
      if (!questionErrors[dupIdx]) questionErrors[dupIdx] = [];
      questionErrors[dupIdx].push(err);
      allErrors.push(err);
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      questionErrors,
      sanitizedQuiz: {
        title: title || `${topic} Quiz Arena`,
        description: quizData.description || `Interactive multiplayer quiz on ${topic}`,
        topic,
        difficulty: quizData.difficulty || 'medium',
        questions: sanitizedQuestions,
        settings: quizData.settings || {},
      },
    };
  },
};

module.exports = QuizValidatorService;
