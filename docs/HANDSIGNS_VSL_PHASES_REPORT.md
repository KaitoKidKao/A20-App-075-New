# Báo cáo triển khai tính năng Handsign / VSL (5 giai đoạn)

Tài liệu tóm tắt những gì đã làm cho luồng **phiên âm → gloss VSL → từ điển HamNoSys → avatar 2D → đồng bộ video**, từ dữ liệu backend tới UI Next.js.

---

## Giai đoạn A — Dữ liệu VSL & tra cứu từ điển (backend)

**Mục tiêu:** Có nguồn `dictionary` + `synonyms` và tra cứu ổn định để `vsl_info` không luôn rỗng.

**Đã làm:**

- File **`src/backend/data/vsl_processed.json`**: cấu trúc khớp script `scratch/process_vsl.py` (`dictionary` + `synonyms`). Có thể tạo lại từ thư mục `data/VSL_HamNoSys` khi cần từ điển đầy đủ.
- Trong **`src/backend/services/ai_service.py`**:
  - **`_gloss_key_forms`**: chuẩn hóa so khớp (khoảng trắng / gạch dưới).
  - **`_resolve_vsl_entry`**: tra trực tiếp `dictionary`, sau đó **`synonyms`** (canonical → danh sách biến thể).
  - **`generate_handsign_data`**: làm giàu mỗi gloss bằng kết quả tra cứu; gloss không có trong từ điển vẫn được giữ với `vsl_info: null`.

---

## Giai đoạn B — API & kiểu dữ liệu (frontend)

**Mục tiêu:** Client gọi được endpoint handsign với type an toàn.

**Đã làm:**

- Trong **`src/frontend/lib/api.ts`**:
  - Types: **`VSLInfo`**, **`HandsSignGloss`**, **`HandsSignResponse`**.
  - **`api.videos.getHandsSign(videoId)`** → `GET /api/videos/{id}/handsign` (kèm Bearer như các API khác).

---

## Giai đoạn C — Tích hợp trang bài học & avatar

**Mục tiêu:** Người dùng xem gloss và avatar đồng bộ thời gian phát.

**Đã làm:**

- **`src/frontend/app/student/videos/[id]/page.tsx`**:
  - Fetch handsign (try/catch riêng để không chặn metadata khác).
  - Sắp xếp gloss theo **`time`**.
  - Tab **「VSL Avatar」**: **`SignAvatar2D`** nhận **`currentTime`** từ `<video>`; danh sách nút gloss để seek.
  - Reset state khi đổi **`videoId`**.
- **`src/frontend/components/SignAvatar2D.tsx`** (phiên bản C): dùng **`HandsSignGloss`**; hiển thị gloss chỉ chữ khi thiếu **`hand`** trong từ điển.

---

## Giai đoạn D — Đồng bộ nguồn video & chất lượng gloss (pipeline + proxy)

**Mục tiêu:** Timeline phụ đề / handsign khớp file video thật đã upload; giảm gloss quá dày hoặc lộn thứ tự.

**Đã làm:**

- **Nguồn phát video (Next.js):**
  - Trang bài học ưu tiên **`/api/video/{videoId}`** (đọc file trong `data/uploads/videos` với tên bắt đầu bằng `{videoId}.`).
  - Nếu stream lỗi / không có file → tự **`/demo-video.mp4`** và hiển thị **cảnh báo vàng** (timeline có thể lệch).
  - Nếu cả demo lỗi → UI fallback “Video Feed Unavailable”.
- **`src/frontend/app/api/video/[id]/route.ts`**: bỏ fallback chọn bừa file `.mp4` trong thư mục (tránh phát nhầm video); chỉ phục vụ file khớp **`videoId`**.
- **`generate_handsign_data` (prompt):** thêm hướng dẫn **mật độ gloss** (~3–8 giây / gloss) và **`time`** gắn mốc segment khi có thể.
- **Sau enrich:** **`final_glosses.sort(...)`** theo **`time`**.

**Lưu ý bảo mật / vận hành:** Route Next đọc đĩa cục bộ, chưa gắn JWT; phù hợp dev / mạng tin cậy. Production nên cân nhắc stream qua FastAPI + kiểm tra quyền hoặc URL có token.

---

## Giai đoạn E — Hoàn thiện avatar 2D & hỗ trợ tiếp cận

**Mục tiêu:** Nhiều tag HamNoSys hơn được ánh xạ hợp lý; animation ổn định; screen reader biết gloss hiện tại.

**Đã làm:**

- **`SignAvatar2D`**:
  - Mở rộng **`HAND_MAPPING`**: thêm shape/orient/palm/location phổ biến (ví dụ `hampinch12`, `hamceeall`, `hamextfingeruo`, `hampalmdl`, `hamwrist`, `hamear`, `hamcheek`, …).
  - **Animation:** bỏ **`scale`** đồng thời **`scaleX`/`scaleY`** gây chồng lấn; dùng **`HAND_SCALE`** nhân trực tiếp **`scaleX`/`scaleY`** (lật lòng bàn tay + phóng to).
  - **Semantics / a11y:** bọc trong **`<figure>`** + **`<figcaption>`**; **`aria-label`**; vùng **`aria-live="polite"`** (`LiveCaption`) mô tả gloss / trạng thái nghỉ; ảnh minh họa **`alt=""`** (trang trí).
  - **`key`** trên **`motion.div`**: `${word}-${time}` để chuyển pose đúng khi cùng từ lặp lại.

---

## Tổng hợp file chính đã chạm

| Khu vực | File |
|--------|------|
| Backend | `src/backend/data/vsl_processed.json`, `src/backend/services/ai_service.py` |
| Frontend API | `src/frontend/lib/api.ts` |
| Video proxy | `src/frontend/app/api/video/[id]/route.ts` |
| Trang học | `src/frontend/app/student/videos/[id]/page.tsx` |
| Avatar | `src/frontend/components/SignAvatar2D.tsx` |
| Thử avatar | `src/frontend/app/test-avatar/page.tsx` (mock, không đổi bắt buộc) |

---

## Việc nên làm tiếp (ngoài phạm vi 5 giai đoạn)

- Bảo vệ stream video (cookie / token / backend `FileResponse` + `Depends(get_current_user)`).
- Đồng bộ **`SignAvatar2D`** với bộ sprite thật nếu mở rộng grid tay.
- Kiểm thử E2E: upload → pipeline xong → mở đúng `videoId` → tab VSL khớp thời gian.

---

*Báo cáo được tạo theo trạng thái codebase tại thời điểm hoàn thành giai đoạn E.*
