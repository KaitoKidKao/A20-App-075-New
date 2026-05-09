# Kế hoạch tối ưu hóa tài nguyên Backend (On-demand AI Generation)

Tài liệu này chi tiết các bước chỉnh sửa hệ thống Router và Pipeline để chuyển sang cơ chế xử lý theo yêu cầu (Lazy Loading), giúp tiết kiệm chi phí API và tăng tốc độ phản hồi ban đầu.

## 1. Mục tiêu
- **Giảm tải ban đầu:** Khi upload video, chỉ xử lý những thông tin cốt lõi (Transcription, Summary, Timeline).
- **Tiết kiệm tài nguyên:** Chỉ gọi AI để tạo Mindmap, Quiz, Slides khi người dùng thực sự truy cập vào các tính năng đó.
- **Tự động lưu (Persistence):** Sau khi gen lần đầu, kết quả sẽ được lưu vào DB để các lần truy cập sau là tức thì.

---

## 2. Các thay đổi cụ thể

### A. Cấu trúc lại Pipeline (`src/backend/services/pipeline.py`)
- Loại bỏ 3 dòng lệnh gọi AI gen Mindmap, Quiz, Slides trong hàm `run_video_pipeline`.
- Các trường `mindmap`, `quiz`, `slides` trong bảng `lecturedata` sẽ mặc định để trống (`None`) sau khi upload.

### B. Cập nhật Router (`src/backend/routers/videos.py`)

#### 1. Endpoint `GET /{video_id}/mindmap`
**Logic mới:**
1. Lấy dữ liệu `LectureData` từ DB.
2. Nếu `lecture.mindmap` đã có: Trả về luôn.
3. Nếu `lecture.mindmap` trống:
   - Lấy `transcript` từ bản ghi đó.
   - Gọi `AIService.generate_mindmap(transcript)`.
   - Cập nhật trường `mindmap` vào DB.
   - Trả về kết quả mới gen.

#### 2. Endpoint `GET /{video_id}/quiz`
**Logic tương tự:**
- Kiểm tra `lecture.quiz`.
- Nếu trống, gọi `AIService.generate_quiz(transcript)`.
- Có hỗ trợ nhận `num_questions` từ Query Parameter nếu người dùng muốn tùy chỉnh lúc xem.

#### 3. Endpoint `GET /{video_id}/slides`
**Logic tương tự:**
- Kiểm tra `lecture.slides`.
- Nếu trống, gọi `AIService.generate_slides(transcript)`.

---

## 3. Ưu điểm kỹ thuật
- **Tối ưu DB:** Không làm thay đổi Schema hiện tại.
- **Tối ưu UX:** Người dùng thấy video "Sẵn sàng" nhanh hơn 60-70%.
- **Chi phí:** Không tốn tiền AI cho những tính năng người dùng không dùng tới.

## 4. Rủi ro và Cách xử lý
- **Độ trễ (Latency):** Người đầu tiên xem sẽ phải chờ. 
  - *Giải pháp:* Frontend cần hiển thị Loading Spinner rõ ràng.
- **Race Condition:** Nhiều người cùng gọi gen một lúc cho cùng 1 video.
  - *Giải pháp:* Có thể thêm cơ chế lock đơn giản hoặc chấp nhận AI gen đè (vì kết quả AI thường tương đồng).

---

## 5. Quản lý phân quyền (Auth Management) - *Cập nhật 09/05/2026*
- **Đăng ký:** Hệ thống chỉ cho phép tự đăng ký với `role="student"`. Mọi giá trị role khác gửi lên từ client đều bị bỏ qua.
- **Quản trị viên (Admin):** Chỉ có duy nhất 01 tài khoản admin. Tài khoản này không thể đăng ký qua API mà phải khởi tạo qua script terminal:
  ```bash
  python src/backend/scripts/init_admin.py <email> <password>
  ```
- **Bảo mật:** Điều này đảm bảo người dùng bình thường không bao giờ có thể tự nâng cấp quyền của mình.
