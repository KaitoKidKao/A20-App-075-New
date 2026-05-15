# Phase 6 - Avatar VSL va review gloss

## Muc tieu

Phase 6 tach ro ba lop du lieu:

- `handsign_data`: chuoi gloss VSL co timeline, sinh tu transcript va duoc luu trong `ai_analysis`.
- `handsign payload`: payload phuc vu frontend gom gloss, segment render, trang thai review va disclaimer.
- `avatar video`: artifact tuy chon, co trang thai rieng, khong lam hong bai hoc neu loi API hoac chua cau hinh token.

## Thay doi backend

- Them `normalize_glosses()` de chuan hoa gloss ve cau truc on dinh:
  - `index`
  - `time`
  - `word`
  - `vsl_info`
  - `source`
  - `review_status`
- Them `build_handsign_payload()` de tra ve schema `a20-vsl-gloss/v1`.
- Endpoint `GET /api/videos/{video_id}/handsign` nay tra them:
  - `glosses`
  - `segments`
  - `review_required`
  - `review_status`
  - `disclaimer`
  - `avatar`
  - `handsign_data` duoc giu lai de tuong thich frontend cu.
- Endpoint `PUT /api/videos/{video_id}/handsign` cho phep teacher/admin cap nhat va danh dau gloss da review.
- Endpoint `POST /api/videos/{video_id}/generate-avatar` dung gloss da luu trong `handsign_data`, khong sinh gloss lai tu summary.
- Avatar video tra ve `status` rieng:
  - `not_generated`
  - `ready`
  - `failed`
- Khi thieu `REPLICATE_API_TOKEN` hoac loi sinh video, backend luu cache trang thai `failed` va tra payload loi co kiem soat thay vi lam hong toan bo lesson.

## Thay doi frontend

- Frontend doc `handsignRes.glosses` neu co, fallback ve `handsign_data`.
- Tab Avatar VSL hien thi trang thai avatar va disclaimer.
- Khi sinh avatar bi loi, UI hien thi loi trong card avatar, khong lam mat gloss VSL va avatar 2D.
- API client co them `updateHandsSign()` de phuc vu man hinh review gloss o phase sau.

## Luu y van hanh

- Avatar AI chi nen xem la artifact ho tro truc quan. Noi dung VSL can co giao vien hoac chuyen gia ngon ngu ky hieu review truoc khi cong bo chinh thuc.
- Neu chua cau hinh `REPLICATE_API_TOKEN`, chuc nang Generate Video se tra `status=failed`, nhung transcript, caption, summary va gloss van dung binh thuong.
- File avatar thanh cong duoc serve qua `/api/avatar-video/{video_id}`.

## Huong mo rong

- Them UI rieng cho teacher/admin review tung gloss va sua `vsl_info`.
- Luu lich su version gloss de co the rollback.
- Them job queue rieng cho avatar video neu thoi gian render dai.
