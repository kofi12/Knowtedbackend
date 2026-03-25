BEGIN;

DELETE FROM users
WHERE email LIKE 'demo+%@knowted.local';

WITH u AS (
  INSERT INTO users(email, display_name, auth_provider)
  VALUES ('demo+1@knowted.local', 'Demo User', 'LOCAL')
  RETURNING user_id
),
c AS (
  INSERT INTO courses(user_id, code, name, term)
  SELECT u.user_id, x.code, x.name, x.term
  FROM u
  CROSS JOIN (VALUES
    ('EECS 4315', 'Software Design', 'W2026'),
    ('EECS 3342', 'Computer Networks', 'W2026')
  ) AS x(code, name, term)
  RETURNING course_id, user_id, code
),
d AS (
  INSERT INTO documents(
    user_id, course_id, original_filename,
    storage_bucket, storage_key, content_type,
    file_size_bytes, file_hash_sha256, upload_status
  )
  SELECT
    c.user_id,
    c.course_id,
    x.original_filename,
    'knowted-dev-bucket',
    x.storage_key,
    x.content_type,
    x.file_size_bytes,
    x.file_hash_sha256,
    'READY'
  FROM c
  JOIN (VALUES
    ('EECS 4315', 'lecture_01.pdf', 'courses/eecs4315/lecture_01.pdf', 'application/pdf', 245671::bigint, '1111111111111111111111111111111111111111111111111111111111111111'),
    ('EECS 4315', 'midterm_notes.md', 'courses/eecs4315/midterm_notes.md', 'text/markdown', 12034::bigint, NULL),
    ('EECS 3342', 'tcp_udp_summary.pdf', 'courses/eecs3342/tcp_udp_summary.pdf', 'application/pdf', 88412::bigint, '2222222222222222222222222222222222222222222222222222222222222222')
  ) AS x(course_code, original_filename, storage_key, content_type, file_size_bytes, file_hash_sha256)
    ON x.course_code = c.code
  RETURNING document_id, user_id, course_id
),

-- ✅ continue the SAME WITH chain (no new "WITH" here)
course4315 AS (
  SELECT course_id, user_id
  FROM c
  WHERE code = 'EECS 4315'
  LIMIT 1
),
doc4315 AS (
  SELECT document_id, user_id, course_id
  FROM d
  WHERE course_id = (SELECT course_id FROM course4315)
  LIMIT 1
),
deck_aid AS (
  INSERT INTO study_aids(
    user_id, course_id, document_id, type_id,
    title, description, generation_status, model_name, prompt_version
  )
  SELECT
    c.user_id, c.course_id, d.document_id,
    (SELECT type_id FROM study_aid_types WHERE type_name='FLASHCARD_DECK'),
    'Design Patterns – Quick Deck',
    'Seeded dummy deck',
    'DONE', 'seed', 'v0'
  FROM course4315 c
  JOIN doc4315 d ON d.course_id = c.course_id
  RETURNING study_aid_id
),
deck AS (
  INSERT INTO flashcard_decks(deck_id)
  SELECT study_aid_id FROM deck_aid
  RETURNING deck_id
),
cards AS (
  INSERT INTO flashcards(deck_id, front_text, back_text, order_index)
  SELECT deck.deck_id, x.front, x.back, x.ord
  FROM deck
  CROSS JOIN (VALUES
    ('What is cohesion?', 'How focused a module/class is on a single task.', 1),
    ('What is coupling?', 'How dependent modules/classes are on each other.', 2),
    ('MVC stands for?', 'Model–View–Controller.', 3)
  ) AS x(front, back, ord)
  RETURNING flashcard_id
),
quiz_aid AS (
  INSERT INTO study_aids(
    user_id, course_id, document_id, type_id,
    title, description, generation_status, model_name, prompt_version
  )
  SELECT
    c.user_id, c.course_id, d.document_id,
    (SELECT type_id FROM study_aid_types WHERE type_name='QUIZ'),
    'Software Design – Quiz 1',
    'Seeded dummy quiz',
    'DONE', 'seed', 'v0'
  FROM course4315 c
  JOIN doc4315 d ON d.course_id = c.course_id
  RETURNING study_aid_id
),
quiz AS (
  INSERT INTO quizzes(quiz_id, time_limit_seconds, randomize_questions)
  SELECT study_aid_id, 600, false
  FROM quiz_aid
  RETURNING quiz_id
),
q AS (
  INSERT INTO quiz_questions(quiz_id, question_text, question_type, points, order_index)
  SELECT quiz.quiz_id, x.qtext, x.qtype, x.pts, x.ord
  FROM quiz
  CROSS JOIN (VALUES
    ('Which principle encourages programming to an interface, not an implementation?', 'MCQ', 1, 1),
    ('True/False: High coupling is desirable.', 'TRUE_FALSE', 1, 2)
  ) AS x(qtext, qtype, pts, ord)
  RETURNING question_id, question_text
)

INSERT INTO question_options(question_id, option_text, is_correct, order_index)
SELECT q.question_id, o.otext, o.correct, o.ord
FROM q
JOIN (VALUES
  ('Which principle encourages programming to an interface, not an implementation?', 'Dependency Inversion Principle (DIP)', true, 1),
  ('Which principle encourages programming to an interface, not an implementation?', 'Single Responsibility Principle (SRP)', false, 2),
  ('Which principle encourages programming to an interface, not an implementation?', 'Liskov Substitution Principle (LSP)', false, 3),

  ('True/False: High coupling is desirable.', 'True', false, 1),
  ('True/False: High coupling is desirable.', 'False', true, 2)
) AS o(qtext, otext, correct, ord)
  ON o.qtext = q.question_text;

COMMIT;