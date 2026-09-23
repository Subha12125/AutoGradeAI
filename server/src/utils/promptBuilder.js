function buildEvaluationPrompt(examData) {
  const { subject, totalMarks, rubric } = examData;
  const questions = examData.questions || [];

  let questionsSection;
  // Check if questions contains extracted full text from question paper PDF
  const extractedText = questions.find(q => q.type === 'extracted_text');
  if (extractedText && extractedText.text) {
    questionsSection = `## Question Paper (Extracted Text)\n${extractedText.text.trim()}`;
  } else if (questions.length > 0) {
    questionsSection = `## Questions & Marking Scheme\n${questions.map((q, i) => `Q${i + 1}. ${q.text} [${q.marks} marks]`).join('\n')}`;
  } else {
    questionsSection = `## Questions\nNo specific questions provided. Evaluate all answers found in the answer sheet based on the subject and total marks.`;
  }

  const rubricText = rubric ? rubric.trim() : 'Evaluate based on accuracy, completeness, and clarity of explanation.';

  return `You are an expert exam evaluator. Evaluate the student's answer sheet image(s).

## Exam Information
- Subject: ${subject}
- Total Marks: ${totalMarks}

${questionsSection}

## Rubric
${rubricText}

## Instructions
1. Read each answer from the answer sheet image(s)
2. Compare against the questions and rubric above
3. Assign marks and provide specific feedback per question

## Required JSON Structure
{
  "studentAnswers": [
    {
      "questionNumber": 1,
      "marksAwarded": 5,
      "maxMarks": 10,
      "feedback": "Brief specific feedback",
      "confidence": "high"
    }
  ],
  "totalMarksAwarded": 13,
  "totalMaxMarks": ${totalMarks},
  "overallFeedback": "Brief overall assessment",
  "evaluationNotes": "Any issues reading the sheet"
}

Rules: confidence must be "high"/"medium"/"low". All numbers numeric. totalMarksAwarded = sum of marksAwarded.`;
}

function buildQuestionExtractionPrompt() {
  return `Extract all questions from this question paper image. 

Return ONLY a valid JSON array with this structure (no markdown, no extra text):
[
  {
    "questionNumber": 1,
    "text": "<full question text>",
    "marks": 10,
    "subParts": [
      { "part": "a", "text": "<sub-question text>", "marks": 5 }
    ]
  }
]

IMPORTANT RULES:
- Return ONLY the JSON array
- Do NOT include markdown code fences
- Do NOT include any text before or after the JSON
- If marks are not visible for a question, estimate based on typical distribution
- All numbers must be numeric (not strings)`;
}

module.exports = { buildEvaluationPrompt, buildQuestionExtractionPrompt };
