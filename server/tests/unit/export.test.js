const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const ExportService = require('../../src/services/exportService');
const ResultModel = require('../../src/models/result.model');

describe('Hardcore Export Service Unit Tests', () => {
  test('ExportService exposes toCSV and toPDFData methods', () => {
    assert.equal(typeof ExportService.toCSV, 'function');
    assert.equal(typeof ExportService.toPDFData, 'function');
  });

  test('toCSV throws descriptive error when results array is empty', async () => {
    const originalFindByExam = ResultModel.findByExam;
    ResultModel.findByExam = async () => [];

    try {
      await assert.rejects(
        async () => {
          await ExportService.toCSV('dummy-exam-id');
        },
        {
          name: 'Error',
          message: 'No results found for this exam',
        }
      );
    } finally {
      ResultModel.findByExam = originalFindByExam;
    }
  });

  test('toCSV successfully generates structured CSV with dynamic question headers', async () => {
    const originalFindByExam = ResultModel.findByExam;
    ResultModel.findByExam = async () => [
      {
        total_marks_awarded: 18,
        total_max_marks: 20,
        overall_feedback: 'Demonstrated exceptional understanding of algorithms.',
        students: {
          name: 'Priya Sharma',
          roll_number: '21CS042',
        },
        question_results: [
          { marksAwarded: 9, maxMarks: 10, feedback: 'Great proof' },
          { marksAwarded: 9, maxMarks: 10, feedback: 'Minor edge case missed' },
        ],
      },
    ];

    try {
      const csv = await ExportService.toCSV('test-exam-123');
      assert.ok(csv.includes('Roll Number'));
      assert.ok(csv.includes('Student Name'));
      assert.ok(csv.includes('Q1 Marks Awarded'));
      assert.ok(csv.includes('Q2 Marks Awarded'));
      assert.ok(csv.includes('21CS042'));
      assert.ok(csv.includes('Priya Sharma'));
      assert.ok(csv.includes('90.0')); // percentage (18/20 * 100)
    } finally {
      ResultModel.findByExam = originalFindByExam;
    }
  });
});
