// const { createObjectCsvStringifier } = require('csv-writer');
// const ResultModel = require('../models/result.model');
// const ExamModel = require('../models/exam.model');

// const ExportService = {
//   /**
//    * Export results as CSV string.
//    */
//   async toCSV(examId) {
//     const results = await ResultModel.findByExam(examId);

//     if (!results.length) {
//       throw new Error('No results found for this exam');
//     }

//     // Build CSV headers
//     const headers = [
//       { id: 'rollNumber', title: 'Roll Number' },
//       { id: 'name', title: 'Student Name' },
//     ];

//     // Add question columns dynamically
//     const sampleResult = results[0];
//     if (sampleResult.question_results) {
//       sampleResult.question_results.forEach((_, i) => {
//         headers.push({ id: `q${i + 1}`, title: `Q${i + 1}` });
//       });
//     }

//     headers.push(
//       { id: 'total', title: 'Total Marks' },
//       { id: 'maxMarks', title: 'Max Marks' },
//       { id: 'percentage', title: 'Percentage' },
//       { id: 'feedback', title: 'Overall Feedback' }
//     );

//     const csvStringifier = createObjectCsvStringifier({ header: headers });

//     // Build rows
//     const records = results.map((r) => {
//       const row = {
//         rollNumber: r.students?.roll_number || 'N/A',
//         name: r.students?.name || 'N/A',
//         total: r.total_marks_awarded,
//         maxMarks: r.total_max_marks,
//         percentage: ((r.total_marks_awarded / r.total_max_marks) * 100).toFixed(1),
//         feedback: r.overall_feedback || '',
//       };

//       // Add per-question marks
//       if (r.question_results) {
//         r.question_results.forEach((qr, i) => {
//           row[`q${i + 1}`] = `${qr.marksAwarded}/${qr.maxMarks}`;
//         });
//       }

//       return row;
//     });

//     const headerString = csvStringifier.getHeaderString();
//     const recordsString = csvStringifier.stringifyRecords(records);

//     return headerString + recordsString;
//   },

//   /**
//    * Generate PDF report data (returns structured data for client-side PDF generation).
//    */
//   async toPDFData(examId) {
//     const exam = await ExamModel.findById(examId);
//     const results = await ResultModel.findByExam(examId);
//     const stats = await ResultModel.getExamStats(examId);

//     return {
//       exam: {
//         title: exam.title,
//         subject: exam.subject,
//         totalMarks: exam.total_marks,
//         date: exam.created_at,
//       },
//       stats,
//       results: results.map((r) => ({
//         rollNumber: r.students?.roll_number,
//         name: r.students?.name,
//         totalMarks: r.total_marks_awarded,
//         maxMarks: r.total_max_marks,
//         percentage: ((r.total_marks_awarded / r.total_max_marks) * 100).toFixed(1),
//         questionResults: r.question_results,
//         feedback: r.overall_feedback,
//       })),
//     };
//   },
// };

// module.exports = ExportService;

const { createObjectCsvStringifier } = require('csv-writer');
const ResultModel = require('../models/result.model');
const ExamModel = require('../models/exam.model');

const ExportService = {
  /**
   * Export results as CSV string.
   */
  async toCSV(examId) {
    const results = await ResultModel.findByExam(examId);

    if (!results.length) {
      throw new Error('No results found for this exam');
    }

    // 1. Find the maximum number of questions any student answered to build consistent columns
    let maxQuestions = 0;
    results.forEach(r => {
      const qr = r.question_results;
      if (Array.isArray(qr) && qr.length > maxQuestions) {
        maxQuestions = qr.length;
      }
    });

    // 2. Build the primary headers
    const headers = [
      { id: 'rollNumber', title: 'Roll Number' },
      { id: 'name', title: 'Student Name' },
      { id: 'total', title: 'Total Marks' },
      { id: 'maxMarks', title: 'Max Marks' },
      { id: 'percentage', title: 'Percentage (%)' },
      { id: 'overallFeedback', title: 'Overall Feedback' }
    ];

    // 3. Add dynamic columns for every individual question's Marks and Feedback
    for (let i = 1; i <= maxQuestions; i++) {
      headers.push({ id: `q${i}_marks`, title: `Q${i} Marks Awarded` });
      headers.push({ id: `q${i}_feedback`, title: `Q${i} Feedback` });
    }

    const csvStringifier = createObjectCsvStringifier({ header: headers });

    // Helper: sanitize a CSV cell value (prevent formula injection, strip newlines)
    const sanitize = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      // Replace newlines with spaces so CSV cells don't break rows
      str = str.replace(/[\r\n]+/g, ' ').trim();
      return str;
    };

    // 4. Map the database results to the CSV columns
    const records = results.map((r) => {
      const totalAwarded = r.total_marks_awarded || 0;
      const totalMax = r.total_max_marks || 0;
      const percentage = totalMax > 0
        ? ((totalAwarded / totalMax) * 100).toFixed(1) 
        : '0.0';

      const row = {
        rollNumber: sanitize(r.students?.roll_number || 'N/A'),
        name: sanitize(r.students?.name || 'N/A'),
        total: totalAwarded,
        maxMarks: totalMax,
        percentage: percentage,
        overallFeedback: sanitize(r.overall_feedback || ''),
      };

      // Populate the per-question columns
      // Handle both camelCase (marksAwarded) and snake_case (marks_awarded) field names
      if (Array.isArray(r.question_results)) {
        r.question_results.forEach((qr, i) => {
          const marks = qr.marksAwarded ?? qr.marks_awarded ?? qr.marks ?? '';
          const feedback = qr.feedback ?? qr.comment ?? '';
          row[`q${i + 1}_marks`] = marks;
          row[`q${i + 1}_feedback`] = sanitize(feedback);
        });
      }

      return row;
    });

    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const headerString = csvStringifier.getHeaderString();
    const recordsString = csvStringifier.stringifyRecords(records);

    return BOM + headerString + recordsString;
  },

  /**
   * Generate PDF report data (returns structured data for client-side PDF generation).
   */
  async toPDFData(examId) {
    const exam = await ExamModel.findById(examId);
    const results = await ResultModel.findByExam(examId);
    const stats = await ResultModel.getExamStats(examId);

    return {
      exam: {
        title: exam.title,
        subject: exam.subject,
        totalMarks: exam.total_marks,
        date: exam.created_at,
      },
      stats,
      results: results.map((r) => ({
        rollNumber: r.students?.roll_number,
        name: r.students?.name,
        totalMarks: r.total_marks_awarded,
        maxMarks: r.total_max_marks,
        percentage: ((r.total_marks_awarded / r.total_max_marks) * 100).toFixed(1),
        questionResults: r.question_results,
        feedback: r.overall_feedback,
      })),
    };
  },
};

module.exports = ExportService;