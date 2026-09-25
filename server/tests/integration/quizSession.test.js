const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const QuizModel = require('../../src/models/quiz.model');
const QuizSessionModel = require('../../src/models/quizSession.model');
const QuizParticipantModel = require('../../src/models/quizParticipant.model');
const QuizAnswerModel = require('../../src/models/quizAnswer.model');
const SessionEngine = require('../../src/services/sessionEngine');

describe('AI Quiz Arena - Integration & Multiplayer Session Tests', () => {
  let testTeacherId;
  let testQuiz;
  let testSession;

  before(async () => {
    testTeacherId = crypto.randomUUID();

    // Create test quiz
    testQuiz = await QuizModel.create({
      teacherId: testTeacherId,
      title: 'Realtime Concurrency Arena',
      topic: 'High Performance Computing',
      difficulty: 'medium',
      questions: [
        {
          id: 'q-test-1',
          prompt: 'What is Amdahl Law used for?',
          type: 'MCQ',
          options: ['Parallel speedup limit', 'Sorting complexity', 'Database normalization', 'Network latency'],
          correct_answer: 'Parallel speedup limit',
          difficulty: 3,
          points: 100,
          time_limit: 10,
        },
        {
          id: 'q-test-2',
          prompt: 'Is mutual exclusion necessary for race conditions?',
          type: 'TRUE_FALSE',
          options: ['True', 'False'],
          correct_answer: 'True',
          difficulty: 2,
          points: 100,
          time_limit: 10,
        },
      ],
    });
  });

  it('should create a multiplayer session with unique join code', async () => {
    testSession = await QuizSessionModel.create({
      quizId: testQuiz.id,
      hostId: testTeacherId,
      settings: { adaptive: true, antigravityMode: true },
    });

    assert.ok(testSession.id);
    assert.ok(testSession.join_code);
    assert.equal(testSession.join_code.length, 6);
    assert.equal(testSession.status, 'LOBBY');

    // Look up by join code
    const found = await QuizSessionModel.findByJoinCode(testSession.join_code);
    assert.ok(found);
    assert.equal(found.id, testSession.id);
  });

  it('should allow participants to join and handle reconnection', async () => {
    const p1 = await QuizParticipantModel.join({
      sessionId: testSession.id,
      nickname: 'Neo',
      avatar: 'rocket',
    });

    assert.ok(p1.id);
    assert.equal(p1.nickname, 'Neo');

    // Reconnecting player with same nickname
    const p1Reconnect = await QuizParticipantModel.join({
      sessionId: testSession.id,
      nickname: 'Neo',
      avatar: 'rocket',
    });

    assert.equal(p1Reconnect.id, p1.id, 'Should reuse participant ID on reconnect');
  });

  it('should prevent submission when session is not in QUESTION_ACTIVE state', async () => {
    const participant = await QuizParticipantModel.join({
      sessionId: testSession.id,
      nickname: 'Trinity',
    });

    await assert.rejects(
      async () => {
        await SessionEngine.submitAnswer({
          sessionId: testSession.id,
          participantId: participant.id,
          questionId: 'q-test-1',
          answer: 'Parallel speedup limit',
        });
      },
      /Submissions not accepted/
    );
  });

  it('should activate question and process valid submissions', async () => {
    await SessionEngine.activateQuestion(testSession.id, 0);

    const participant = await QuizParticipantModel.findByNickname(testSession.id, 'Neo');

    const result = await SessionEngine.submitAnswer({
      sessionId: testSession.id,
      participantId: participant.id,
      questionId: 'q-test-1',
      answer: 'Parallel speedup limit',
    });

    assert.equal(result.isCorrect, true);
    assert.ok(result.pointsAwarded >= 100);
    assert.equal(result.newStreak, 1);
  });

  it('should prevent duplicate submissions from the same participant', async () => {
    const participant = await QuizParticipantModel.findByNickname(testSession.id, 'Neo');

    await assert.rejects(
      async () => {
        await SessionEngine.submitAnswer({
          sessionId: testSession.id,
          participantId: participant.id,
          questionId: 'q-test-1',
          answer: 'Parallel speedup limit',
        });
      },
      /already submitted an answer/
    );
  });

  it('should maintain sorted real-time leaderboard', async () => {
    const p2 = await QuizParticipantModel.join({
      sessionId: testSession.id,
      nickname: 'Morpheus',
    });

    await SessionEngine.activateQuestion(testSession.id, 0);

    // Morpheus submits wrong answer
    await SessionEngine.submitAnswer({
      sessionId: testSession.id,
      participantId: p2.id,
      questionId: 'q-test-1',
      answer: 'Sorting complexity',
    });

    const leaderboard = await SessionEngine.getLeaderboard(testSession.id);
    assert.ok(leaderboard.length >= 2);
    assert.equal(leaderboard[0].nickname, 'Neo', 'Neo should be #1');
    assert.ok(leaderboard[0].score > leaderboard[1].score);
  });

  // Concurrency Simulation: 10, 50, and 100 concurrent participants!
  describe('High-Concurrency Stress Testing', () => {
    async function simulateClassroom(count) {
      const simSession = await QuizSessionModel.create({
        quizId: testQuiz.id,
        hostId: testTeacherId,
      });

      // Join N concurrent participants
      const joinPromises = [];
      for (let i = 0; i < count; i++) {
        joinPromises.push(
          QuizParticipantModel.join({
            sessionId: simSession.id,
            nickname: `Student_${count}_${i}`,
          })
        );
      }
      const participants = await Promise.all(joinPromises);
      assert.equal(participants.length, count);

      // Activate question
      await SessionEngine.activateQuestion(simSession.id, 0);

      // Submit answers concurrently
      const submitPromises = participants.map((p, idx) => {
        const isRight = idx % 2 === 0;
        return SessionEngine.submitAnswer({
          sessionId: simSession.id,
          participantId: p.id,
          questionId: 'q-test-1',
          answer: isRight ? 'Parallel speedup limit' : 'Wrong Answer',
        });
      });

      const results = await Promise.all(submitPromises);
      assert.equal(results.length, count);

      const rightAnswers = results.filter((r) => r.isCorrect);
      assert.equal(rightAnswers.length, Math.ceil(count / 2));

      // Verify authoritative leaderboard consistency
      const finalLb = await SessionEngine.getLeaderboard(simSession.id);
      assert.equal(finalLb.length, count);

      // Verify monotonic non-increasing scores
      for (let i = 1; i < finalLb.length; i++) {
        assert.ok(finalLb[i - 1].score >= finalLb[i].score, 'Leaderboard must be strictly ordered');
      }

      await SessionEngine.endSession(simSession.id, testTeacherId);
    }

    it('should handle 10 concurrent participants cleanly', async () => {
      await simulateClassroom(10);
    });

    it('should handle 50 concurrent participants cleanly', async () => {
      await simulateClassroom(50);
    });

    it('should handle 100 concurrent participants without race conditions', async () => {
      await simulateClassroom(100);
    });
  });
});
