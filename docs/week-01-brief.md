# 📄 1-Page Brief — Accessibility AI Tool for Visually Impaired Users
**Dự án:** A20-App-075 | **Giai đoạn:** Week 01 — Research & Discovery | **Ngày:** 2026-04-14

---

## 👤 User Persona

### Persona 1 — Minh, 21 tuổi · Sinh viên Đại học
- **Hoàn cảnh:** Mù bẩm sinh, sử dụng NVDA làm công cụ hàng ngày trên Windows.
- **Nhu cầu:** Đọc tài liệu PDF môn học (thường là PDF ảnh, không có text layer), theo dõi bài giảng trên Zoom, và tra cứu thông tin nhanh.
- **Pain points:** PDF bài giảng không có tag → NVDA đọc "trống"; thao tác LMS (Moodle/Canvas) bị lỗi focus-jump; cần phải nhờ bạn bè giải thích biểu đồ/hình ảnh.
- **Hành vi:** Học 6–8 giờ/ngày,  ưu tiên công cụ miễn phí và hoạt động offline.

### Persona 2 — Lan, 35 tuổi · Nhân viên văn phòng thị giác yếu (Low Vision)
- **Hoàn cảnh:** Thị lực 10%, sử dụng phóng to màn hình kết hợp TTS (text-to-speech).
- **Nhu cầu:** Đọc email, hợp đồng, và báo cáo Word/PDF; ghi chú nhanh trong cuộc họp.
- **Pain points:** Phần mềm TTS trả phí đắt; giọng đọc tiếng Việt chất lượng thấp, phát âm sai tên riêng; không có caption tiếng Việt thời gian thực trong meeting.
- **Hành vi:** Ưu tiên tích hợp sẵn vào hệ sinh thái Microsoft 365; ngân sách hạn chế.

---

## ❗ Problem Statement

> **Sinh viên và người đi làm khiếm thị / thị giác yếu tại Việt Nam** gặp khó khăn nghiêm trọng khi **tiếp cận tài liệu học tập và công việc dưới dạng PDF ảnh, biểu đồ, và nội dung trực quan**, đặc biệt khi **sử dụng công cụ hỗ trợ như NVDA hay screen reader trên nền tảng giáo dục/doanh nghiệp**. Điều này dẫn đến **mất bình đẳng trong học tập/làm việc, phụ thuộc vào người khác, và giảm hiệu suất**, chủ yếu vì **các nền tảng hiện tại không được thiết kế theo chuẩn accessibility (WCAG), giọng đọc tiếng Việt kém chất lượng, và không có giải pháp tích hợp AI toàn diện dành riêng cho người dùng Việt Nam**.

---

## 🔍 Competitor Analysis

| Sản phẩm | ✅ Pros | ❌ Cons | 🕳️ Gaps |
|---|---|---|---|
| **Be My Eyes AI** (Be My AI) | - Mô tả thế giới thực bằng camera AI, miễn phí hoàn toàn | - Cần internet liên tục; rủi ro privacy; không hỗ trợ tiếng Việt bản địa hóa | - Không hỗ trợ OCR tài liệu kỹ thuật; không có chế độ offline; không tích hợp LMS |
| **NaturalReader** | - Đa dạng định dạng (PDF, DOCX, web); nhiều giọng AI tự nhiên | - Giọng tiếng Việt hạn chế; bản miễn phí không có tính năng nâng cao; không thời gian thực | - Thiếu captioning thời gian thực; không mô tả hình ảnh/biểu đồ; không offline |
| **Microsoft Immersive Reader** | - Tích hợp sâu vào MS 365; miễn phí; focus tools & line highlight | - Chỉ hoạt động trong hệ sinh thái Microsoft; không xử lý PDF ảnh; không mô tả hình ảnh | - Không có AI thông minh xử lý đa ngữ; không hỗ trợ biểu đồ; thiếu captioning meeting |

---

## 🚀 Điểm Khác Biệt (Unique Selling Points)

1. **🇻🇳 Tiếng Việt bản địa hóa hoàn toàn** — TTS & STT chất lượng cao cho tiếng Việt, phát âm đúng tên riêng và từ chuyên ngành, không phụ thuộc giọng nước ngoài.
2. **📄 OCR thông minh cho tài liệu Việt Nam** — Tự động nhận dạng và đọc PDF ảnh, slide bài giảng, biểu đồ; tích hợp mô tả hình ảnh bằng AI (image captioning).
3. **🆓 Freemium hướng đến người khiếm thị** — Toàn bộ tính năng core miễn phí cho người dùng khiếm thị được xác thực; không paywall cho chức năng thiết yếu.
4. **🔌 Tích hợp đa nền tảng học tập** — Plugin/extension cho LMS phổ biến (Moodle, Google Classroom), tương thích NVDA và VoiceOver, API mở cho trường học.
5. **💬 Captioning thời gian thực (tiếng Việt)** — Phụ đề trực tiếp cho cuộc họp Zoom/Teams bằng tiếng Việt, hỗ trợ người vừa khiếm thị vừa khó khăn nghe.

---

## 📝 Tóm Tắt & Next Steps

**Tóm tắt:** Thị trường accessibility cho người Việt Nam đang bị bỏ ngỏ — các công cụ quốc tế mạnh nhưng thiếu bản địa hóa tiếng Việt, không xử lý được định dạng tài liệu giáo dục phổ biến tại Việt Nam (PDF ảnh, slide bài giảng), và đặt phần lớn tính năng sau paywall. Sản phẩm của chúng ta nhắm đến gap này với AI tiếng Việt, OCR chuyên dụng và chính sách miễn phí thực sự cho người khiếm thị.

**Next Steps (Week 02):**
- [ ] Phỏng vấn 2–3 sinh viên khiếm thị (email/Zoom) hoặc tự test NVDA trên LMS thực tế để bổ sung pain points thực địa.
- [ ] Xác định tech stack: ASR/TTS engine tiếng Việt (Whisper, PhoWhisper, Zalo AI…) và OCR pipeline (Tesseract + VietOCR vs. cloud API).
- [ ] Xây dựng dataset mẫu: thu thập 10–20 PDF bài giảng thực tế để benchmark OCR accuracy.
- [ ] Thống nhất WER/MOS metrics để đo chất lượng TTS & STT tiếng Việt trong sprint tiếp theo.

---
*Document maintained by: Data/QA/PM Role — A20-App-075 | Revision: v1.0*
