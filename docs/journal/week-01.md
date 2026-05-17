# Weekly Journal — Week 01

## Mục tiêu tuần
- Khởi tạo dự án và định hướng kiến trúc hệ thống.
- Research các công nghệ cốt lõi phục vụ bài toán hỗ trợ sinh viên khiếm thính.
- Thiết lập frontend base, AI log hub và thử nghiệm pipeline xử lý tài liệu/video.

## Kết quả đã đạt được
- Setup frontend base, UV environment và AI-Log Hub.
- Research ASR, TTS và các hướng xử lý audio/video phục vụ caption generation.
- Test PyMuPDF và nhiều hướng parse PDF/DOCX khác nhau.
- Build thử core flow:
  - ingest file PDF/DOCX bằng Chandra
  - trích xuất text
  - đưa text qua edge-tts để sinh audio.
- Test edge-tts và đánh giá khả năng tích hợp vào pipeline.
- Viết brief ban đầu cho sản phẩm.
- Thu thập và phân loại dữ liệu:
  - tài liệu text thuần
  - tài liệu có bảng biểu, hình minh họa và công thức.

## Khó khăn
- Việc parse các tài liệu chứa bảng, hình ảnh và công thức còn chưa ổn định.
- Chưa xác định được hướng xử lý tối ưu cho tài liệu học thuật phức tạp.

## Cách giải quyết
- So sánh nhiều thư viện parse tài liệu khác nhau.
- Tách riêng các nhóm dữ liệu để đánh giá pipeline phù hợp.
- Chuẩn bị thêm dữ liệu mẫu phục vụ testing.

## Kế hoạch tuần sau
- Xây dựng persona và problem statement rõ ràng hơn.
- Thiết kế UI/UX prototype.
- Build lại codebase theo hướng tập trung cho sinh viên khiếm thính.
- Tích hợp FE/BE cơ bản.