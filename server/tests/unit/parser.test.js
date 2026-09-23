const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { parseEvaluationResponse, extractStudentInfo } = require('../../src/utils/parser');

describe('Hardcore Parser & Extractor Test Suite', () => {
  describe('extractStudentInfo() Edge Cases & Suffix Sanitization', () => {
    test('cleans suffix _Answer correctly from single and multi-word names', () => {
      const res = extractStudentInfo('Priyam_Kumar_Mishra_Answer.pdf');
      assert.equal(res.name, 'Priyam Kumar Mishra');
      assert.notEqual(res.name.toLowerCase(), 'answer');
    });

    test('cleans suffix _AnswerSheet, -Submission, and _Scan', () => {
      const res1 = extractStudentInfo('Ananya_Sharma_AnswerSheet.pdf');
      assert.equal(res1.name, 'Ananya Sharma');

      const res2 = extractStudentInfo('Rohan-Verma-Submission.pdf');
      assert.equal(res2.name, 'Rohan Verma');

      const res3 = extractStudentInfo('Vikram_Singh_scan.pdf');
      assert.equal(res3.name, 'Vikram Singh');
    });

    test('extracts Roll Number at the beginning: 21BCE1002_Priyam_Mishra.pdf', () => {
      const res = extractStudentInfo('21BCE1002_Priyam_Mishra.pdf');
      assert.equal(res.rollNumber, '21BCE1002');
      assert.equal(res.name, 'Priyam Mishra');
    });

    test('extracts numeric Roll Number at the beginning: 104_Aditi_Gupta.pdf', () => {
      const res = extractStudentInfo('104_Aditi_Gupta.pdf');
      assert.equal(res.rollNumber, '104');
      assert.equal(res.name, 'Aditi Gupta');
    });

    test('extracts Roll Number at the end: Alice_Smith_1092.pdf', () => {
      const res = extractStudentInfo('Alice_Smith_1092.pdf');
      assert.equal(res.rollNumber, '1092');
      assert.equal(res.name, 'Alice Smith');
    });

    test('handles empty, null, or extreme whitespace filenames without crashing', () => {
      const emptyRes = extractStudentInfo('');
      assert.equal(emptyRes.name, 'Student');
      assert.equal(emptyRes.rollNumber, 'N/A');

      const nullRes = extractStudentInfo(null);
      assert.equal(nullRes.name, 'Student');
      assert.equal(nullRes.rollNumber, 'N/A');

      const spaceRes = extractStudentInfo('   .pdf   ');
      assert.equal(spaceRes.name, 'Student');
      assert.equal(spaceRes.rollNumber, 'N/A');
    });
  });

  describe('parseEvaluationResponse() Gemini Response Parsing', () => {
    test('parses perfectly formatted JSON', () => {
      const raw = JSON.stringify({
        studentAnswers: [
          { questionNumber: 1, marksAwarded: 5, maxMarks: 5, feedback: 'Excellent' },
          { questionNumber: 2, marksAwarded: 3, maxMarks: 5, feedback: 'Partial derivation' }
        ],
        totalMarksAwarded: 8,
        totalMaxMarks: 10,
        overallFeedback: 'Good overall understanding.'
      });

      const parsed = parseEvaluationResponse(raw);
      assert.equal(parsed.success, true);
      assert.equal(parsed.data.totalMarksAwarded, 8);
      assert.equal(parsed.data.totalMaxMarks, 10);
      assert.equal(parsed.data.studentAnswers.length, 2);
    });

    test('strips markdown code fence: ```json ... ```', () => {
      const raw = '```json\n{"studentAnswers":[{"questionNumber":1,"marksAwarded":10,"maxMarks":10,"feedback":"Flawless"}],"totalMarksAwarded":10,"totalMaxMarks":10,"overallFeedback":"Great job!"}\n```';
      const parsed = parseEvaluationResponse(raw);
      assert.equal(parsed.success, true);
      assert.equal(parsed.data.totalMarksAwarded, 10);
      assert.equal(parsed.data.overallFeedback, 'Great job!');
    });

    test('handles conversational preamble before JSON object', () => {
      const raw = 'Here is your evaluation report in JSON format:\n\n{"studentAnswers":[{"questionNumber":1,"marksAwarded":4,"maxMarks":5,"feedback":"Minor math error"}],"overallFeedback":"Keep practicing."}\n\nHope this helps!';
      const parsed = parseEvaluationResponse(raw);
      assert.equal(parsed.success, true);
      assert.equal(parsed.data.studentAnswers[0].marksAwarded, 4);
      // Auto-calculated total
      assert.equal(parsed.data.totalMarksAwarded, 4);
    });

    test('normalizes snake_case keys (student_answers, total_marks_awarded, overall_feedback)', () => {
      const raw = JSON.stringify({
        student_answers: [
          { question_number: 1, marks_awarded: 7, max_marks: 10, feedback: 'Well structured' }
        ],
        total_marks_awarded: 7,
        total_max_marks: 10,
        overall_feedback: 'Demonstrated deep conceptual mastery.'
      });

      const parsed = parseEvaluationResponse(raw);
      assert.equal(parsed.success, true);
      assert.equal(parsed.data.totalMarksAwarded, 7);
      assert.equal(parsed.data.overallFeedback, 'Demonstrated deep conceptual mastery.');
      assert.equal(parsed.data.studentAnswers[0].questionNumber, 1);
    });

    test('fails gracefully when response is completely invalid or missing studentAnswers', () => {
      const invalidJson = 'Not a json document at all';
      const parsed1 = parseEvaluationResponse(invalidJson);
      assert.equal(parsed1.success, false);
      assert.match(parsed1.error, /Failed to parse AI response/i);

      const missingAnswers = JSON.stringify({ summary: 'No student answers here' });
      const parsed2 = parseEvaluationResponse(missingAnswers);
      assert.equal(parsed2.success, false);
      assert.match(parsed2.error, /missing required "studentAnswers"/i);
    });
  });
});
