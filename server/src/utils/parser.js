/**
 * Parses Gemini's JSON response from evaluation.
 * Handles markdown code blocks, extra whitespace, and raw JSON.
 */
function parseEvaluationResponse(rawText) {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const codeFenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeFenceMatch) {
    cleaned = codeFenceMatch[1].trim();
  }

  // Try to extract JSON object if there's extra text before/after
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    const jsonStart = cleaned.indexOf('{');
    if (jsonStart !== -1) {
      // Find the matching closing brace
      let depth = 0;
      let jsonEnd = -1;
      for (let i = jsonStart; i < cleaned.length; i++) {
        if (cleaned[i] === '{') depth++;
        if (cleaned[i] === '}') depth--;
        if (depth === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
      if (jsonEnd > jsonStart) {
        cleaned = cleaned.substring(jsonStart, jsonEnd);
      }
    }
  }

  try {
    const parsed = JSON.parse(cleaned);

    // Validate expected structure
    if (!parsed.studentAnswers && !parsed.student_answers) {
      return {
        success: false,
        error: 'Response missing required "studentAnswers" field',
        raw: rawText.substring(0, 500),
      };
    }

    // Normalize: accept both camelCase and snake_case from the model
    if (parsed.student_answers && !parsed.studentAnswers) {
      parsed.studentAnswers = parsed.student_answers;
      delete parsed.student_answers;
    }
    if (parsed.total_marks_awarded !== undefined && parsed.totalMarksAwarded === undefined) {
      parsed.totalMarksAwarded = parsed.total_marks_awarded;
      delete parsed.total_marks_awarded;
    }
    if (parsed.total_max_marks !== undefined && parsed.totalMaxMarks === undefined) {
      parsed.totalMaxMarks = parsed.total_max_marks;
      delete parsed.total_max_marks;
    }
    if (parsed.overall_feedback !== undefined && parsed.overallFeedback === undefined) {
      parsed.overallFeedback = parsed.overall_feedback;
      delete parsed.overall_feedback;
    }
    if (parsed.evaluation_notes !== undefined && parsed.evaluationNotes === undefined) {
      parsed.evaluationNotes = parsed.evaluation_notes;
      delete parsed.evaluation_notes;
    }

    // Normalize studentAnswers fields
    if (Array.isArray(parsed.studentAnswers)) {
      parsed.studentAnswers = parsed.studentAnswers.map(sa => ({
        questionNumber: sa.questionNumber ?? sa.question_number ?? 0,
        marksAwarded: sa.marksAwarded ?? sa.marks_awarded ?? 0,
        maxMarks: sa.maxMarks ?? sa.max_marks ?? 0,
        feedback: sa.feedback || '',
        confidence: sa.confidence || 'medium',
      }));
    }

    // Ensure totalMarksAwarded is a number
    if (typeof parsed.totalMarksAwarded === 'string') {
      parsed.totalMarksAwarded = parseFloat(parsed.totalMarksAwarded) || 0;
    }
    if (typeof parsed.totalMaxMarks === 'string') {
      parsed.totalMaxMarks = parseFloat(parsed.totalMaxMarks) || 0;
    }

    // Auto-calculate totals if missing
    if (parsed.totalMarksAwarded === undefined || parsed.totalMarksAwarded === null) {
      parsed.totalMarksAwarded = parsed.studentAnswers.reduce((sum, sa) => sum + (sa.marksAwarded || 0), 0);
    }
    if (parsed.totalMaxMarks === undefined || parsed.totalMaxMarks === null) {
      parsed.totalMaxMarks = parsed.studentAnswers.reduce((sum, sa) => sum + (sa.maxMarks || 0), 0);
    }

    return { success: true, data: parsed };
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse AI response: ${err.message}`,
      raw: rawText.substring(0, 500),
    };
  }
}

/**
 * Extracts student info from PDF text or filename.
 * Handles patterns like:
 * - "Priyam_Kumar_Mishra_Answer.pdf" -> Name: "Priyam Kumar Mishra"
 * - "21BCE1002_Priyam_Mishra.pdf" -> Roll: "21BCE1002", Name: "Priyam Mishra"
 * - "John_Doe.pdf" -> Name: "John Doe"
 */
function extractStudentInfo(filename) {
  // Strip file extension after trimming surrounding whitespace
  let clean = (filename || '').trim().replace(/\.(pdf|jpe?g|png|webp)$/i, '').trim();

  // Strip common suffixes like _Answer, _AnswerSheet, _Sheet, _Submission, _Exam
  clean = clean.replace(/[_-]?(?:answers?(?:[-_]?sheet)?|submissions?|exam|paper|scan)$/i, '').trim();

  // Check for separator between roll number and name
  const parts = clean.split(/[_-]/).filter(Boolean);

  if (parts.length >= 2) {
    const isFirstRoll = /^([A-Z]{0,4}\d{2,}[A-Z0-9]*|\d+)$/i.test(parts[0]);
    const isLastRoll = /^([A-Z]{0,4}\d{2,}[A-Z0-9]*|\d+)$/i.test(parts[parts.length - 1]);

    if (isFirstRoll && !isLastRoll) {
      return {
        rollNumber: parts[0],
        name: parts.slice(1).join(' '),
      };
    } else if (isLastRoll && !isFirstRoll) {
      return {
        rollNumber: parts[parts.length - 1],
        name: parts.slice(0, -1).join(' '),
      };
    }
  }

  const formattedName = clean.replace(/[_-]+/g, ' ').trim();
  return {
    rollNumber: clean ? clean.replace(/\s+/g, '_') : 'N/A',
    name: formattedName || 'Student',
  };
}

module.exports = { parseEvaluationResponse, extractStudentInfo };
