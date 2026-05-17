# Thiết kế Cơ sở dữ liệu & Xác thực Người dùng (LMS Core)

Tài liệu này mô tả chi tiết thiết kế hệ thống lưu trữ và bảo mật cho dự án A20 Video Captioning & AI Analysis, được nâng cấp lên quy mô Hệ thống quản lý học tập (LMS). 

*Lưu ý: Thiết kế này tập trung vào các tính năng cốt lõi (LMS Core) và các bảng hỗ trợ xử lý AI hiện có.*

## 1. Cơ sở dữ liệu (Database)

Hệ thống sử dụng **SQLite** (phát triển) và sẵn sàng chuyển đổi sang **PostgreSQL** (production) nhờ sử dụng SQLModel/SQLAlchemy.

### 1.1. Sơ đồ DBML (Thiết kế chi tiết)

```dbml
// =========================
// USER MANAGEMENT
// =========================

Table users {
  id uuid [pk]
  full_name varchar
  email varchar [unique, not null]
  password_hash varchar [not null]
  role_id uuid [ref: > roles.id]
  is_deleted boolean [default: false]
  created_at timestamp
  updated_at timestamp
}

Table profiles {
  id uuid [pk]
  user_id uuid [unique, ref: > users.id]
  avatar_url varchar
  bio text
  learning_goals text
  certifications json
  created_at timestamp
  updated_at timestamp
}

Table roles {
  id uuid [pk]
  name varchar [unique] // admin | instructor | student
  description text
}

Table permissions {
  id uuid [pk]
  name varchar [unique]
  description text
}

Table role_permissions {
  role_id uuid [ref: > roles.id]
  permission_id uuid [ref: > permissions.id]

  indexes {
    (role_id, permission_id) [pk]
  }
}

// =========================
// COURSE ARCHITECTURE
// =========================

Table categories {
  id uuid [pk]
  parent_id uuid [ref: > categories.id]
  name varchar
  description text
  is_deleted boolean [default: false]
  created_at timestamp
}

Table courses {
  id uuid [pk]
  category_id uuid [ref: > categories.id]
  instructor_id uuid [ref: > users.id]

  title varchar
  description text
  price decimal
  thumbnail_url varchar

  level varchar
  language varchar

  is_published boolean [default: false]
  is_deleted boolean [default: false]

  created_at timestamp
  updated_at timestamp

  indexes {
    title
    category_id
    instructor_id
  }
}

Table modules {
  id uuid [pk]
  course_id uuid [ref: > courses.id]

  title varchar
  description text
  sort_order int

  created_at timestamp
}

Table lessons {
  id uuid [pk]
  module_id uuid [ref: > modules.id]

  title varchar
  lesson_type varchar // video | text | quiz | assignment
  duration_minutes int

  is_preview boolean [default: false]
  sort_order int

  created_at timestamp
}

Table content_metadata {
  id uuid [pk]
  lesson_id uuid [ref: > lessons.id]

  video_url varchar
  article_content text
  attachment_url varchar

  // Metadata bổ sung cho Video & Avatar
  avatar_video_url varchar
  handsign_manifest_url varchar

  // Lưu trữ các kết quả phân tích AI (Transcript, Summary, Mindmap, v.v.)
  ai_analysis jsonb 

  created_at timestamp
}

// =========================
// PROGRESS & ENROLLMENT
// =========================

Table enrollments {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  course_id uuid [ref: > courses.id]
  enrollment_status varchar // active | completed | cancelled
  started_at timestamp
  completed_at timestamp
  created_at timestamp

  indexes {
    (user_id, course_id) [unique]
  }
}

Table user_progress {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  lesson_id uuid [ref: > lessons.id]
  completion_status varchar // not_started | in_progress | completed
  progress_percent int
  last_accessed_at timestamp
  completed_at timestamp

  indexes {
    (user_id, lesson_id) [unique]
  }
}

// =========================
// QUIZ & ASSESSMENT
// =========================

Table quizzes {
  id uuid [pk]
  lesson_id uuid [ref: > lessons.id]
  title varchar
  passing_score int
  time_limit_minutes int
  created_at timestamp
}

Table questions {
  id uuid [pk]
  quiz_id uuid [ref: > quizzes.id]
  question_type varchar // mcq | essay | matching
  question_data jsonb
  score int
  sort_order int
}

Table quiz_attempts {
  id uuid [pk]
  quiz_id uuid [ref: > quizzes.id]
  user_id uuid [ref: > users.id]
  score decimal
  status varchar // in_progress | submitted
  created_at timestamp
}

// =========================
// SUPPORTING FEATURES
// =========================

Table processing_jobs {
  id uuid [pk]
  lesson_id uuid [ref: > lessons.id]
  job_type varchar // video_pipeline | avatar_generation
  status varchar // queued | processing | completed | failed
  progress int
  error_message text
  created_at timestamp
  updated_at timestamp
}

Table flashcards {
  id uuid [pk]
  lesson_id uuid [ref: > lessons.id]
  front text
  back text
  hint text
  created_at timestamp
}
```

## 2. Chiến lược lưu trữ & Xử lý AI

- **Lưu trữ File**: Video, tài liệu và các sản phẩm AI (Avatar video) sẽ được quản lý qua đường dẫn trực tiếp trong `content_metadata`.
- **Dữ liệu AI trích xuất**: 
    - `transcript`, `summary`, `mindmap`, `viz_data`, `handsign_data` sẽ được lưu trong `content_metadata.ai_analysis` dưới dạng JSONB. 
- **Theo dõi tiến độ**: Bảng `processing_jobs` chịu trách nhiệm ghi lại trạng thái của các tác vụ chạy ngầm, đảm bảo tính nhất quán cho các API `/status` và `/job-status`.

## 3. Xác thực & Bảo mật (Authentication)

- **Cơ chế**: JWT (JSON Web Token) kết hợp với **RBAC** (Role-Based Access Control).
- **Phân quyền**:
    - **Admin**: Quản lý toàn bộ hệ thống, User, Categories.
    - **Instructor**: Tạo khóa học, quản lý bài học, xem thống kê sinh viên.
    - **Student**: Đăng ký khóa học, học bài, làm Quiz, xem tiến độ.

## 4. Kế hoạch triển khai (Roadmap)

### Giai đoạn 1: Foundation (Khởi tạo lại từ đầu)
- [ ] Xóa Database cũ, khởi tạo lại cấu trúc SQLModel cho User, Role, Profile.
- [ ] Xây dựng lại logic Auth hỗ trợ RBAC.
- [ ] Triển khai các Model cho Course Architecture (Category, Course, Module, Lesson).
- [ ] Triển khai Model cho Processing Jobs.

### Giai đoạn 2: Interaction & Content
- [ ] Triển khai Enrollment và Tracking tiến độ học tập.
- [ ] Chuyển đổi dữ liệu AI hiện tại sang cấu trúc `content_metadata`.
- [ ] Xây dựng hệ thống Quiz và Flashcards hoàn chỉnh.

### Giai đoạn 3: Optimization
- [ ] Tối ưu hóa API Performance và Database Indexing.
- [ ] Hoàn thiện giao diện quản lý khóa học cho Instructor.

---
*Cập nhật lần cuối: 14/05/2026*
