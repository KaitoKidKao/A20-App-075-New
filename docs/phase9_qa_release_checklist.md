# Phase 9 - Checklist QA truoc release

## Muc tieu

Checklist nay dung de xac nhan san pham da san sang demo/public beta cho ung dung giao duc ho tro nguoi khiem thinh. Moi muc can ghi ket qua `Pass`, `Fail`, `Blocked` va nguoi phu trach.

## 1. Smoke test he thong

- [ ] `GET /api/health` tra `healthy`.
- [ ] `GET /api/health/deep` co check database.
- [ ] `GET /api/metrics` tra `request_count`.
- [ ] Frontend mo duoc trang `/`.
- [ ] Login student thanh cong.
- [ ] Login teacher/admin thanh cong.
- [ ] Cookie auth la HttpOnly.
- [ ] Logout xoa session.

Lenh nhanh:

```powershell
.\scripts\qa_smoke.ps1
```

## 2. Luong E2E cot loi

- [ ] Register tai khoan moi.
- [ ] Login bang tai khoan vua tao.
- [ ] Upload video MP4 nho.
- [ ] Trang processing hien trang thai queue/worker.
- [ ] Video xu ly xong chuyen sang lesson page.
- [ ] Caption co 2 ngon ngu `VI` va `EN`.
- [ ] Doi caption `VI`/`EN` khong bi tron ngon ngu.
- [ ] Timeline caption khop thoi gian video.
- [ ] Click transcript tua dung vi tri.
- [ ] Xem video toi hon 50%, refresh trang, video resume dung vi tri gan nhat.
- [ ] Ket thuc video, progress thanh completed.
- [ ] Flashcard co the lat the.
- [ ] Bam `Da nho`/`Can on lai` luu duoc trang thai on tap.
- [ ] Dashboard student hien khoa dang hoc, bai dang do, diem quiz gan day.
- [ ] Dashboard admin/teacher hien so hoc sinh, video loi, bai pho bien.

## 3. Accessibility

- [ ] Dung duoc bang ban phim: tab, enter, space, arrow.
- [ ] Focus ring thay ro tren button/link/tab.
- [ ] Video play/pause bang keyboard.
- [ ] Caption doc ro o desktop.
- [ ] Caption doc ro o mobile.
- [ ] Caption khong che nut dieu khien video.
- [ ] Co tuy chon co chu caption.
- [ ] Co tuy chon vi tri caption.
- [ ] Co tuy chon nen caption.
- [ ] Reduced motion khong gay mat phuong huong.
- [ ] Tab panel co `role`/`aria-selected` hop ly.
- [ ] Screen reader doc duoc ten button quan trong.

## 4. Mobile viewport

Kiem tra toi thieu:

- [ ] 360 x 740
- [ ] 390 x 844
- [ ] 768 x 1024

Tieu chi:

- [ ] Khong co text bi tran khoi nut/card.
- [ ] Caption khong overlap transcript/action chinh.
- [ ] Flashcard khong bi cat noi dung.
- [ ] Dashboard student doc duoc khong can zoom ngang.

## 5. Resilience

- [ ] Tat Redis, upload video local fallback khong crash API.
- [ ] Bat lai Redis, worker nhan job moi.
- [ ] Worker dung giua chung, job co `failed` hoac retry metadata.
- [ ] Thieu OpenAI key, pipeline tra loi loi ro rang, khong mat file upload.
- [ ] Thieu Replicate token, avatar tra `failed` nhung lesson van xem duoc.
- [ ] Upload file qua size bi chan.
- [ ] Upload MIME sai bi chan.
- [ ] URL localhost/private bi chan khi process URL.

## 6. Video dai va file lon

- [ ] Video 5 phut xu ly thanh cong.
- [ ] Video 30 phut khong timeout API upload.
- [ ] File gan gioi han `MAX_UPLOAD_SIZE_MB` bi xu ly dung.
- [ ] Caption song ngu van giu dung timeline.
- [ ] AI artifacts loi mot phan khong lam hong transcript/caption.

## 7. Noi dung va ngon ngu ky hieu

- [ ] Caption tieng Viet tu nhien, khong nhay sang tieng Anh giua cau.
- [ ] Caption tieng Anh day du.
- [ ] VSL gloss bam theo timeline.
- [ ] Avatar AI co disclaimer ro rang.
- [ ] Teacher/admin co the review gloss truoc khi generate avatar.
- [ ] Manifest render tai ve duoc.

## 8. Ket qua release

Truoc khi release can ghi:

- Ngay test:
- Build/commit:
- Nguoi test:
- Moi truong:
- So bug blocker:
- So bug major:
- So bug minor:
- Quyet dinh release: `Go` / `No-Go`
