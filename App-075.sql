-- Simplified Schema for Educational AI Platform (PostgreSQL)

-- 1. Roles
CREATE TABLE "roles" (
  "id" uuid PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL,
  "description" text
);

-- 2. Users & Profiles
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "full_name" varchar,
  "email" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "role_id" uuid REFERENCES "roles"("id"),
  "is_deleted" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "avatar_url" varchar,
  "bio" text,
  "learning_goals" text,
  "certifications" jsonb,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- 3. Course Hierarchy
CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY,
  "parent_id" uuid REFERENCES "categories"("id"),
  "name" varchar NOT NULL,
  "description" text,
  "is_deleted" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "courses" (
  "id" uuid PRIMARY KEY,
  "category_id" uuid REFERENCES "categories"("id"),
  "instructor_id" uuid REFERENCES "users"("id"),
  "title" varchar NOT NULL,
  "description" text,
  "price" decimal DEFAULT 0,
  "thumbnail_url" varchar,
  "level" varchar, -- Beginner, Intermediate, Advanced
  "language" varchar DEFAULT 'vi',
  "is_published" boolean DEFAULT false,
  "is_deleted" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "modules" (
  "id" uuid PRIMARY KEY,
  "course_id" uuid REFERENCES "courses"("id") ON DELETE CASCADE,
  "title" varchar NOT NULL,
  "description" text,
  "sort_order" int DEFAULT 0,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "lessons" (
  "id" uuid PRIMARY KEY,
  "module_id" uuid REFERENCES "modules"("id") ON DELETE CASCADE,
  "title" varchar NOT NULL,
  "lesson_type" varchar, -- video, article, quiz
  "duration_minutes" int DEFAULT 0,
  "is_preview" boolean DEFAULT false,
  "sort_order" int DEFAULT 0,
  "created_at" timestamptz DEFAULT now()
);

-- 4. Content & AI Metadata
CREATE TABLE "content_metadata" (
  "id" uuid PRIMARY KEY,
  "lesson_id" uuid UNIQUE REFERENCES "lessons"("id") ON DELETE CASCADE,
  "video_url" varchar,
  "article_content" text,
  "attachment_url" varchar,
  "avatar_video_url" varchar,
  "handsign_manifest_url" varchar,
  "ai_analysis" jsonb,
  "created_at" timestamptz DEFAULT now()
);

-- 5. Progress & Enrollment
CREATE TABLE "enrollments" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid REFERENCES "users"("id"),
  "course_id" uuid REFERENCES "courses"("id"),
  "enrollment_status" varchar DEFAULT 'active', -- active, completed, cancelled
  "started_at" timestamptz DEFAULT now(),
  "completed_at" timestamptz,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "user_progress" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid REFERENCES "users"("id"),
  "lesson_id" uuid REFERENCES "lessons"("id"),
  "completion_status" varchar DEFAULT 'in_progress', -- in_progress, completed
  "progress_percent" int DEFAULT 0,
  "last_accessed_at" timestamptz DEFAULT now(),
  "completed_at" timestamptz
);

-- 6. Assessment
CREATE TABLE "quizzes" (
  "id" uuid PRIMARY KEY,
  "lesson_id" uuid REFERENCES "lessons"("id") ON DELETE CASCADE,
  "title" varchar NOT NULL,
  "passing_score" int DEFAULT 80,
  "time_limit_minutes" int,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "questions" (
  "id" uuid PRIMARY KEY,
  "quiz_id" uuid REFERENCES "quizzes"("id") ON DELETE CASCADE,
  "question_type" varchar, -- multiple_choice, boolean
  "question_data" jsonb, -- choices, correct_answer
  "score" int DEFAULT 1,
  "sort_order" int DEFAULT 0
);

CREATE TABLE "quiz_attempts" (
  "id" uuid PRIMARY KEY,
  "quiz_id" uuid REFERENCES "quizzes"("id"),
  "user_id" uuid REFERENCES "users"("id"),
  "score" decimal,
  "status" varchar, -- passed, failed
  "answers_json" jsonb, -- save user answers for review
  "created_at" timestamptz DEFAULT now()
);

-- 7. Flashcards & Spaced Repetition
CREATE TABLE "flashcards" (
  "id" uuid PRIMARY KEY,
  "lesson_id" uuid REFERENCES "lessons"("id") ON DELETE CASCADE,
  "front" text NOT NULL,
  "back" text NOT NULL,
  "hint" text,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "user_flashcard_progress" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid REFERENCES "users"("id"),
  "flashcard_id" uuid REFERENCES "flashcards"("id"),
  "box_level" int DEFAULT 1, -- For Spaced Repetition (Leitner system)
  "next_review_at" timestamptz DEFAULT now(),
  "last_reviewed_at" timestamptz
);

-- 8. AI Processing Jobs
CREATE TABLE "processing_jobs" (
  "id" uuid PRIMARY KEY,
  "lesson_id" uuid REFERENCES "lessons"("id"),
  "job_type" varchar, -- transcript, sign_language, infographic
  "status" varchar DEFAULT 'pending', -- pending, processing, completed, failed
  "progress" int DEFAULT 0,
  "error_message" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX ON "courses" ("title");
CREATE INDEX ON "courses" ("category_id");
CREATE INDEX ON "courses" ("instructor_id");
CREATE INDEX ON "modules" ("course_id", "sort_order");
CREATE INDEX ON "lessons" ("module_id", "sort_order");
CREATE UNIQUE INDEX ON "enrollments" ("user_id", "course_id");
CREATE UNIQUE INDEX ON "user_progress" ("user_id", "lesson_id");
CREATE INDEX ON "user_flashcard_progress" ("user_id", "next_review_at");
