# Phase 7 - Theo doi tien do hoc tap

## Muc tieu

Phase 7 chuyen ung dung tu cong cu xu ly video sang nen tang hoc tap co kha nang theo doi tien do. He thong nay uu tien ba nhom du lieu:

- Tien do xem bai hoc: phan tram hoan thanh, thoi luong da xem, vi tri xem cuoi.
- Tien do on tap: flashcard da hoc, can on lai, so lan review.
- Ket qua danh gia: diem quiz va lich su lam bai.

## Thay doi backend

- Mo rong bang `user_progress`:
  - `watched_seconds`
  - `last_position_seconds`
  - `duration_seconds`
- Mo rong bang `user_flashcard_progress`:
  - `review_count`
  - `correct_count`
  - `incorrect_count`
  - `status`
- Them migration Alembic `f4a1b7c9d2e3_add_learning_progress_tracking.py`.
- Endpoint `POST /api/student/lessons/{lesson_id}/progress` tra ve record progress va nhan them thong tin resume video.
- Endpoint `GET /api/student/dashboard` tra ve:
  - khoa dang hoc
  - bai chua hoan thanh
  - diem quiz gan day
  - hoat dong gan day
  - thoi luong hoc
- Endpoint flashcard review luu them so lan on va trang thai `learning/learned`.
- Them quiz API:
  - `GET /api/student/lessons/{lesson_id}/quizzes`
  - `POST /api/student/quizzes/{quiz_id}/submit`
- Them `GET /api/admin/dashboard` cho teacher/admin:
  - so hoc sinh
  - video xu ly loi
  - bai hoc pho bien
  - ty le hoan thanh

## Thay doi frontend

- Trang video lesson tai progress da luu va tua ve `last_position_seconds` khi mo lai bai.
- Progress duoc luu moi 10 giay, khong spam API moi frame.
- Flashcard co nut `Can on lai` va `Da nho` de ghi nhan trang thai on tap.
- Trang `/student/library` dung dashboard API that thay vi mock data.
- Trang `/admin` doc dashboard API that khi co quyen teacher/admin.

## Van hanh

Sau khi pull code can chay:

```powershell
python -m alembic upgrade head
python -m pytest -q src/backend/tests
cd src/frontend
npm run lint
```

## Gioi han con lai

- UI lam quiz day du chua duoc gan vao video lesson page, nhung backend submit quiz da san sang.
- Dashboard admin hien thong tin tong quan; cac drill-down chi tiet co the lam tiep o Phase 8/9.
