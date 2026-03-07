-- =========================================
-- KNOW-TED (Updated Schema) - PostgreSQL
-- =========================================
-- Enable UUID generation (Postgres)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- -------------------------
-- USERS + AUTH
-- -------------------------
CREATE TABLE users (
  user_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT NOT NULL UNIQUE,
  display_name     TEXT,
  password_hash    TEXT,
  auth_provider    TEXT NOT NULL DEFAULT 'LOCAL',
  provider_user_id TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_oauth_unique UNIQUE (auth_provider, provider_user_id)
);

-- -------------------------
-- COURSES 
-- -------------------------
CREATE TABLE courses (
  course_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  code        TEXT,
  name        TEXT NOT NULL,
  term        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_user_id ON courses(user_id);


-- -------------------------
-- DOCUMENTS (uploaded notes/textbooks metadata)
-- files themselves go to S3
-- -------------------------
CREATE TABLE documents (
  document_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  course_id         UUID REFERENCES courses(course_id) ON DELETE SET NULL,

  original_filename TEXT NOT NULL,
  content_type      TEXT,
  file_size_bytes   BIGINT,
  file_hash_sha256  TEXT,

  s3_bucket         TEXT,
  s3_key            TEXT NOT NULL,
  s3_etag           TEXT,

  upload_status     TEXT NOT NULL DEFAULT 'READY',
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id   ON documents(user_id);
CREATE INDEX idx_documents_course_id ON documents(course_id);
CREATE INDEX idx_documents_s3_key    ON documents(s3_key);

-- Optional but useful: allow duplicates but prevent exact same doc stored twice per user/course
-- CREATE UNIQUE INDEX uniq_doc_user_course_s3key ON documents(user_id, course_id, s3_key);

-- -------------------------
-- STUDY AID TYPES (lookup)
-- -------------------------
CREATE TABLE study_aid_types (
  type_id    SMALLSERIAL PRIMARY KEY,
  type_name  TEXT NOT NULL UNIQUE
);

INSERT INTO study_aid_types(type_name) VALUES ('FLASHCARD_DECK'), ('QUIZ')
ON CONFLICT DO NOTHING;

CREATE TABLE study_aids (
  study_aid_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  course_id         UUID REFERENCES courses(course_id) ON DELETE SET NULL,
  document_id       UUID REFERENCES documents(document_id) ON DELETE SET NULL,
  type_id           SMALLINT NOT NULL REFERENCES study_aid_types(type_id),

  title             TEXT NOT NULL,
  description       TEXT,

  generation_status TEXT NOT NULL DEFAULT 'DONE',
  model_name        TEXT,
  prompt_version    TEXT,
  error_message     TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_study_aids_user_id     ON study_aids(user_id);
CREATE INDEX idx_study_aids_course_id   ON study_aids(course_id);
CREATE INDEX idx_study_aids_document_id ON study_aids(document_id);
CREATE INDEX idx_study_aids_type_id     ON study_aids(type_id);

CREATE TABLE flashcard_decks (
  deck_id UUID PRIMARY KEY REFERENCES study_aids(study_aid_id) ON DELETE CASCADE
);

CREATE TABLE flashcards (
  flashcard_id BIGSERIAL PRIMARY KEY, -- can remain BIGSERIAL
  deck_id      UUID NOT NULL REFERENCES flashcard_decks(deck_id) ON DELETE CASCADE,
  front_text   TEXT NOT NULL,
  back_text    TEXT NOT NULL,
  order_index  INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quizzes (
  quiz_id UUID PRIMARY KEY REFERENCES study_aids(study_aid_id) ON DELETE CASCADE,
  time_limit_seconds INT,
  randomize_questions BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE quiz_questions (
  question_id   BIGSERIAL PRIMARY KEY, -- can remain BIGSERIAL
  quiz_id       UUID NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'MCQ',
  points        INT NOT NULL DEFAULT 1,
  order_index   INT NOT NULL DEFAULT 0
);

CREATE TABLE question_options (
  option_id    BIGSERIAL PRIMARY KEY,
  question_id  BIGINT NOT NULL REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
  option_text  TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE,
  order_index  INT NOT NULL DEFAULT 0
);

CREATE TABLE quiz_attempts (
  attempt_id    BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  quiz_id       UUID NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  score         NUMERIC(6,2),
  total_points  INT
);

CREATE TABLE quiz_attempt_answers (
  attempt_answer_id BIGSERIAL PRIMARY KEY,
  attempt_id        BIGINT NOT NULL REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,

  question_id       BIGINT REFERENCES quiz_questions(question_id) ON DELETE SET NULL,
  selected_option_id BIGINT REFERENCES question_options(option_id) ON DELETE SET NULL,

  question_text_snapshot TEXT NOT NULL,
  selected_option_text_snapshot TEXT,
  is_correct       BOOLEAN,
  answered_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
  tag_id  BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name    TEXT NOT NULL,
  CONSTRAINT uniq_user_tag UNIQUE (user_id, name)
);

CREATE TABLE study_aid_tags (
  study_aid_id UUID NOT NULL REFERENCES study_aids(study_aid_id) ON DELETE CASCADE,
  tag_id       BIGINT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
  PRIMARY KEY (study_aid_id, tag_id)
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempt_answers_attempt_id ON quiz_attempt_answers(attempt_id);
CREATE INDEX idx_study_aid_tags_tag_id ON study_aid_tags(tag_id);
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);