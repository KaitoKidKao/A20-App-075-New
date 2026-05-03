# Thiết kế Cơ sở dữ liệu & Xác thực Người dùng (Backend)

Tài liệu này mô tả chi tiết thiết kế hệ thống lưu trữ và bảo mật cho dự án A20 Video Captioning & AI Analysis.

## 1. Cơ sở dữ liệu (Database)

Hệ thống sử dụng **SQLite** làm cơ sở dữ liệu tạm thời cho giai đoạn phát triển. SQLite là cơ sở dữ liệu dạng file, không cần server riêng, dễ dàng quản lý và backup.

### 1.1. Sơ đồ các bảng

#### Bảng `users` (Người dùng)
Lưu trữ thông tin tài khoản của giảng viên (admin) và sinh viên.
- `id`: Định danh duy nhất (UUID).
- `email`: Địa chỉ email (duy nhất, dùng để đăng nhập).
- `password_hash`: Mật khẩu đã được mã hóa an toàn bằng thuật toán Bcrypt.
- `full_name`: Họ và tên người dùng.
- `role`: Vai trò (`admin` hoặc `student`).
- `created_at`: Thời gian tạo tài khoản.

#### Bảng `videos` (Video bài giảng)
Lưu trữ metadata của các video được tải lên.
- `id`: Định danh duy nhất (UUID).
- `user_id`: ID của người dùng đã tải video lên.
- `title`: Tiêu đề bài giảng.
- `storage_path`: Đường dẫn vật lý tới file video trên ổ đĩa (ví dụ: `data/uploads/videos/abc.mp4`).
- `status`: Trạng thái xử lý (`queued`, `processing`, `completed`, `failed`).
- `created_at`: Thời gian tải lên.

#### Bảng `lecture_data` (Kết quả phân tích AI)
Lưu trữ toàn bộ nội dung AI trích xuất được từ video.
- `video_id`: ID của video tương ứng (Foreign Key).
- `transcript`: Nội dung phụ đề (dạng JSON).
- `summary`: Tóm tắt bài giảng.
- `timeline`: Các mốc thời gian/chương bài giảng (JSON).
- `highlights`: Các điểm nhấn quan trọng (JSON).
- `questions`: Các câu hỏi rephrase (JSON).
- `briefing`: Thông tin Hướng dẫn trước bài học (JSON).

### 1.2. Sơ đồ thiết kế (Entity Relationship Diagram)
Bạn có thể xem sơ đồ quan hệ giữa các bảng tại: [dbdiagram.io - A20 App 075](https://dbdiagram.io/d/App-075-69f510b2c6a36f9c1bdd22f5)

## 2. Chiến lược lưu trữ File

- **Video gốc**: Được lưu trữ tại thư mục `data/uploads/videos/`. Database chỉ lưu đường dẫn để truy xuất.
- **Lý do**: Video có dung lượng lớn, lưu vào DB sẽ làm giảm hiệu năng hệ thống. Trong tương lai (Production), thư mục này có thể dễ dàng chuyển sang các dịch vụ lưu trữ đám mây như Amazon S3 mà không cần thay đổi cấu trúc Database.
- **Dọn dẹp**: Các kết quả trung gian dạng JSON trước đây đã được xóa bỏ sau khi tích hợp thành công vào Database để tối ưu dung lượng.

## 3. Xác thực & Bảo mật (Authentication)

Hệ thống sử dụng cơ chế **JWT (JSON Web Token)** để xác thực người dùng.

### 3.1. Quy trình thực hiện
1. **Đăng ký**: Người dùng gửi thông tin tới API. Mật khẩu sẽ được mã hóa bằng muối (salt) trước khi lưu vào DB.
2. **Đăng nhập**: Backend kiểm tra email và mật khẩu. Nếu đúng, trả về một chuỗi `access_token`.
3. **Truy cập API & Phân quyền (RBAC)**: 
    - Với các API cần bảo mật (như upload video), người dùng phải gửi kèm `access_token`.
    - Hệ thống kiểm tra quyền sở hữu: Người dùng chỉ có thể xem/truy cập dữ liệu của chính mình (dựa trên `user_id`), trừ khi có vai trò là `admin`.

### 3.2. Công nghệ sử dụng
- **SQLModel**: Để tương tác với database theo hướng hướng đối tượng (ORM).
- **python-jose**: Để tạo và xác thực JWT Token.
- **bcrypt**: Thư viện mã hóa mật khẩu trực tiếp (đảm bảo tương thích với Python 3.12+).

## 4. Trạng thái hiện tại

1. ✅ Khởi tạo cấu trúc Database và các Model.
2. ✅ Triển khai logic Đăng ký/Đăng nhập.
3. ✅ Tích hợp DB vào luồng xử lý video hiện tại.
4. ✅ Cập nhật các API để lấy dữ liệu từ DB thay vì đọc file trực tiếp.
5. ✅ Triển khai phân quyền (Ownership checks) và tối ưu hóa truy vấn.
