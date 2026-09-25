-- ============================================
-- AI Quiz Arena - Database Schema Migration
-- Migration: 003_quiz_arena.sql
-- ============================================

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT DEFAULT '',
  topic VARCHAR(255) NOT NULL,
  difficulty VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic);

-- 2. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('MCQ', 'TRUE_FALSE', 'MULTI_SELECT', 'MATCHING', 'ORDERING', 'FILL_BLANK', 'SCENARIO', 'IMAGE_BASED')),
  prompt TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer JSONB NOT NULL,
  explanation TEXT DEFAULT '',
  difficulty INTEGER DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 5),
  points INTEGER DEFAULT 100,
  time_limit INTEGER DEFAULT 30,
  learning_objective TEXT DEFAULT '',
  media_url TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_diff ON quiz_questions(quiz_id, difficulty);

-- 3. QUIZ SESSIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  join_code VARCHAR(12) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'STARTING', 'QUESTION_ACTIVE', 'QUESTION_LOCKED', 'RESULT', 'NEXT_QUESTION', 'FINISHED', 'PAUSED')),
  current_question_index INTEGER DEFAULT 0,
  question_started_at TIMESTAMPTZ DEFAULT NULL,
  started_at TIMESTAMPTZ DEFAULT NULL,
  ended_at TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  settings JSONB DEFAULT '{"adaptive": false, "antigravityMode": false, "streakBonus": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_code ON quiz_sessions(join_code);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz ON quiz_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_host ON quiz_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status);

-- 4. QUIZ PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS quiz_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nickname VARCHAR(100) NOT NULL,
  avatar VARCHAR(255) DEFAULT 'rocket',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'finished')),
  current_score INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  current_difficulty INTEGER DEFAULT 2,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_participants_session ON quiz_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_participants_score ON quiz_participants(session_id, current_score DESC);

-- 5. QUIZ ANSWERS TABLE
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES quiz_participants(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  response_time INTEGER NOT NULL DEFAULT 0,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, participant_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_session ON quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_participant ON quiz_answers(participant_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON quiz_answers(question_id);

-- 6. QUIZ EVENTS TABLE
CREATE TABLE IF NOT EXISTS quiz_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_events_session ON quiz_events(session_id);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_events ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES (Allow public/anon reads for active sessions/questions, service role full access)
DO $$
BEGIN
  -- Quizzes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'quizzes_all') THEN
    CREATE POLICY "quizzes_all" ON quizzes FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Quiz questions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_questions' AND policyname = 'quiz_questions_all') THEN
    CREATE POLICY "quiz_questions_all" ON quiz_questions FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Quiz sessions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_sessions' AND policyname = 'quiz_sessions_all') THEN
    CREATE POLICY "quiz_sessions_all" ON quiz_sessions FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Quiz participants
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_participants' AND policyname = 'quiz_participants_all') THEN
    CREATE POLICY "quiz_participants_all" ON quiz_participants FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Quiz answers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_answers' AND policyname = 'quiz_answers_all') THEN
    CREATE POLICY "quiz_answers_all" ON quiz_answers FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Quiz events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_events' AND policyname = 'quiz_events_all') THEN
    CREATE POLICY "quiz_events_all" ON quiz_events FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
