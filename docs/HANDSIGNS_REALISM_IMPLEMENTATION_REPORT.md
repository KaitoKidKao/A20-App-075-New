# Báo cáo triển khai: Handsign thực tế hơn (Giai đoạn 0 → 3)

Tài liệu mô tả **những gì đã được triển khai trong codebase** cho lộ trình làm mượt / chuẩn hóa dữ liệu handsign VSL, chuẩn bị render ngoài và stub trích xuất pose — phù hợp với kế hoạch “avatar → pose → (tuỳ chọn) gen video” đã thảo luận.

---

## Tổng quan

| Giai đoạn | Mục tiêu | Trạng thái trong repo |
|-----------|----------|------------------------|
| **0** | Giảm cảm giác “nhảy cứng” giữa các tư thế 2D | Đã triển khai: nội suy pose trong ~28% đầu mỗi đoạn gloss |
| **1** | Timeline chuẩn + export cho Blender/Unity | Đã triển khai: API + nút tải JSON trên UI |
| **2** | Trích xuất pose từ video (MediaPipe) | Stub script + nhánh tùy chọn khi có thư viện |
| **3** | Gen video (AnimateDiff, v.v.) | **Chưa** tích hợp mô hình; chỉ hướng dẫn an toàn trong báo cáo |

---

## Giai đoạn 0 — Nội suy mượt (frontend)

**Vấn đề:** Tay đổi pose đột ngột theo từng gloss.

**Giải pháp:**

- `src/frontend/lib/handsignSegments.ts` — hàm `expandHandsSignSegments`: biến chuỗi `{ time, word, vsl_info }` thành các đoạn `[start, end]` (khớp backend).
- `src/frontend/lib/handsignPose.ts` — ánh xạ HamNoSys → số (%, góc, sprite grid), `lerpNumericPose`, `poseForTimeInSegment` với **smoothstep** ở ~**28%** đầu đoạn để blend từ pose trước sang pose hiện tại.
- `src/frontend/components/SignAvatar2D.tsx` — dùng các module trên; `motion.div` cập nhật tween ngắn (0,08s) theo pose đã blend.

**Giới hạn:** Vẫn là sprite 2D; không thay thế chuyển động 3D người thật.

---

## Giai đoạn 1 — Segment timeline + manifest export (backend + UI)

**Backend**

- `src/backend/services/handsign_animation_service.py`
  - `expand_handsign_segments(...)`
  - `build_render_manifest(...)` — schema `a20-handsign-export/v1`, `fps` mặc định 30.
- `src/backend/main.py`
  - `GET /api/videos/{video_id}/handsign-segments`
  - `GET /api/videos/{video_id}/handsign-export`  
  Cùng kiểm tra quyền với các endpoint video khác.

**Frontend**

- `src/frontend/lib/api.ts` — types `HandsSignSegment`, `HandsSignSegmentsResponse`, `HandsSignExportManifest`; methods `getHandsSignSegments`, `getHandsSignExport`.
- `src/frontend/app/student/videos/[id]/page.tsx` — tab VSL: nút **“Tải manifest render (JSON)”** gọi export và tải file.

**Kiểm thử**

- `src/backend/tests/test_handsign_animation_service.py` — kiểm tra độ dài đoạn và schema manifest.

---

## Giai đoạn 2 — Stub trích xuất pose (script)

**File:** `scripts/extract_pose_stub.py`

- Không có `mediapipe` / `opencv-python`: ghi JSON **placeholder** (schema `a20-pose-stub/v1`, `frames: []`).
- Có đủ thư viện: đọc vài mốc cổ tay (landmark 15/16) mỗi N frame — **minh họa kỹ thuật**, chưa map sang rig VSL đầy đủ.

**Chạy ví dụ**

```bash
python scripts/extract_pose_stub.py path/to/video.mp4 out/poses.json
```

---

## Giai đoạn 3 — Gen video (chưa code, khuyến nghị)

**Lý do chưa tích hợp:** Mô hình tạo video tự do dễ làm **méo ngón / sai ký hiệu**, gây hại cho người câm điếc nếu tin tưởng là VSL chuẩn.

**Hướng an toàn khi triển khai sau:**

1. Render chính từ **DCC** (Blender/Unity) dùng manifest giai đoạn 1.
2. Gen video chỉ là **lớp phụ** (ánh sáng, camera) với **strength thấp** hoặc mask giữ vùng tay.
3. Luôn kèm **phụ đề** + **review** người biết VSL.

---

## Danh sách file đã thêm / sửa (lần này)

| File | Thay đổi |
|------|----------|
| `src/backend/services/handsign_animation_service.py` | Mới |
| `src/backend/main.py` | +2 endpoint |
| `src/backend/tests/test_handsign_animation_service.py` | Mới |
| `src/frontend/lib/handsignSegments.ts` | Mới |
| `src/frontend/lib/handsignPose.ts` | Mới |
| `src/frontend/lib/api.ts` | +types & API |
| `src/frontend/components/SignAvatar2D.tsx` | Segment + nội suy |
| `src/frontend/app/student/videos/[id]/page.tsx` | Nút tải manifest |
| `scripts/extract_pose_stub.py` | Mới |

---

## Gợi ý bước tiếp

- Nối manifest vào **template Blender** (scripting) để xuất MP4 một lần bấm.
- Mở rộng `HAND_MAPPING` / rig 3D theo từ điển HamNoSys đầy đủ.
- Khi ổn định pose từ giai đoạn 2, thêm bước **retarget** sang rig avatar thay vì dùng trực tiếp landmark thô.

---

*Báo cáo này bổ sung cho `HANDSIGNS_VSL_PHASES_REPORT.md` (các giai đoạn A–E trước đó về API, tab VSL, video proxy).*
