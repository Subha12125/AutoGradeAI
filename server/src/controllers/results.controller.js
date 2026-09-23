const ResultModel = require('../models/result.model');
const ExportService = require('../services/exportService');

/**
 * GET /api/results/:examId
 */
async function getResults(req, res, next) {
  try {
    const { examId } = req.params;

    // Get successful results
    const results = await ResultModel.findByExam(examId);
    const stats = await ResultModel.getExamStats(examId);

    // Get failed evaluations to display as failed results
    const { data: evaluations, error: evalError } = await require('../config/supabase')
      .from('evaluations')
      .select('*, students(*)')
      .eq('exam_id', examId)
      .eq('status', 'failed');

    if (evalError) {
      throw evalError;
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
