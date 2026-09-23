const ResultModel = require('../models/result.model');
const ExportService = require('../services/exportService');
const supabase = require('../config/supabase');

/**
 * GET /api/results/:examId
 */
async function getResults(req, res, next) {
  try {
    const { examId } = req.params;

    // Fetch successful results and failed evaluations concurrently in parallel
    const [results, { data: evaluations, error: evalError }] = await Promise.all([
      ResultModel.findByExam(examId),
      supabase
        .from('evaluations')
        .select('*, students(*)')
        .eq('exam_id', examId)
        .eq('status', 'failed')
    ]);

    if (evalError) {
      throw evalError;
    }

    // Compute stats in-memory instantly (0ms) instead of making an extra roundtrip to Supabase
    let stats = null;
    if (results && results.length > 0) {
      const marks = results.map(r => r.total_marks_awarded ?? 0);
      stats = {
        totalStudents: results.length,
        average: Number((marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(1)),
        highest: Math.max(...marks),
        lowest: Math.min(...marks),
        maxMarks: results[0]?.total_max_marks || 100,
      };
    }

    // Map failed evaluations to results format
    const failedResults = (evaluations || []).map(e => ({
      id: e.id,
      studentName: e.students?.name || 'Unknown',
      rollNumber: e.students?.roll_number || 'N/A',
      marksAwarded: 0,
      maxMarks: 0,
      feedback: e.feedback || 'Evaluation failed',
      createdAt: e.created_at,
      status: 'failed'
    }));

    // Map successful results
    const mappedResults = results.map(r => ({
      id: r.id,
      studentName: r.students?.name || 'Unknown',
      rollNumber: r.students?.roll_number || 'N/A',
      marksAwarded: r.total_marks_awarded,
      maxMarks: r.total_max_marks,
      feedback: r.overall_feedback,
      overallFeedback: r.overall_feedback,
      questionResults: r.question_results || [],
      createdAt: r.created_at,
      status: 'completed'
    }));

    // Combine and sort by creation date
    const allResults = [...mappedResults, ...failedResults].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ results: allResults, stats });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/results/:examId/student/:studentId
 */
async function getStudentResult(req, res, next) {
  try {
    const { examId, studentId } = req.params;

    const result = await ResultModel.findByStudentAndExam(studentId, examId);

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({ result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/results/:examId/export/csv
 */
async function exportCSV(req, res, next) {
  try {
    const { examId } = req.params;
    const csv = await ExportService.toCSV(examId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="results-${examId}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/results/:examId/export/pdf
 */
async function exportPDF(req, res, next) {
  try {
    const { examId } = req.params;
    const pdfData = await ExportService.toPDFData(examId);

    // Send structured data for client-side PDF generation
    res.json(pdfData);
  } catch (err) {
    next(err);
  }
}

module.exports = { getResults, getStudentResult, exportCSV, exportPDF };
