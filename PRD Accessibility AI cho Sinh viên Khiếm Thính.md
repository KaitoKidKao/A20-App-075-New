**Product Requirements Document (PRD) – Accessibility AI cho Sinh viên Khiếm Thính (Deaf Student Assistant)**

**Ngày:** 28/04/2026

**Mục tiêu:** Xây dựng MVP hỗ trợ sinh viên khiếm thính tham gia học hòa nhập tốt hơn thông qua caption thời gian thực và tóm tắt nội dung.

## **1\. Problem Statement (Phát biểu vấn đề)**

**1.1. UC1 — Lớp học trực tiếp**

Sinh viên khiếm thính học hòa nhập tại các trường đại học Việt Nam gặp phải rào cản giao tiếp tức thì trong lớp học — cụ thể là không thể theo dõi nội dung thảo luận nhóm, câu hỏi bạn học đặt ra, hoặc giải thích miệng của giảng viên trong thời gian thực. Điều này dẫn đến việc:

* Liên tục bỏ lỡ kiến thức quan trọng tại các thời điểm cốt lõi của buổi học.  
* Mất khả năng phản ứng và tham gia đối thoại.  
* Dần hình thành tâm lý thụ động, cô lập ngay trong chính lớp mình đang ngồi.

Hiện không tồn tại giải pháp nào có thể nhận diện giọng nói đa người trong môi trường lớp học, chuyển đổi thành văn bản tiếng Việt với độ trễ thấp đủ để theo kịp hội thoại tự nhiên, và hiển thị kết quả lên màn hình chung hoặc thiết bị cá nhân mà không cần phần cứng đặc biệt hay phiên dịch viên ngôn ngữ ký hiệu.  
**1.2. UC2 — Video bài giảng**

Sinh viên khiếm thính học qua tài liệu video tại các trường đại học Việt Nam gặp phải vấn đề thiếu phụ đề chính xác và thiếu cơ chế tóm tắt nội dung học thuật khi tiếp cận video bài giảng, slide có âm thanh, và tài liệu đa phương tiện. Hậu quả là:

* Buộc phải đoán mò nội dung từ hình ảnh đơn thuần.  
* Học sai hoặc học thiếu kiến thức so với bạn học có thính giác.  
* Tốn gấp nhiều lần thời gian để bù đắp khoảng trống hiểu biết qua các nguồn thứ cấp.

| Nguồn | Số liệu thực | Đối tượng |
| ----- | ----- | ----- |
| Speechmatics (2023) | YouTube auto-caption đạt 60–70% accuracy tổng thể — tương đương 1 trong 3 từ sai [OBS](https://obsproject.com/forum/resources/localvocal-local-live-captions-translation-on-the-go.1769/) | Tiếng Anh tổng quát |
| WMT2023 Benchmarks | Accuracy của YouTube drops below 60% cho tiếng Hindi, Swahili và Vietnamese [Wowza](https://www.wowza.com/docs/convert-speech-to-text-to-generate-live-stream-captions-with-openai-whisper) | Tiếng Việt |
| VietMed Paper (domain y tế) | Model XLSR-53 đạt WER 29.6% trên domain y tế tiếng Việt sau khi được fine-tune — giảm từ 51.8% của baseline [arXiv](https://ar5iv.labs.arxiv.org/html/2406.02555) | Tiếng Việt domain chuyên ngành |
| CHI 2023 | Các hệ thống captioning thương mại đạt accuracy 69–88% cho ngôn ngữ high-resource như tiếng Anh và tiếng Đức [ITNEXT](https://itnext.io/whisperflow-a-real-time-speech-to-text-library-274279d98cba) | Ngôn ngữ phổ biến |

 Ngoài ra, không có công cụ nào tự động chắt lọc nội dung video thành bullet point ngắn gọn theo từng đoạn, phù hợp với ngữ cảnh giáo dục và ngôn ngữ tiếng Việt.  
**1.3. Bản tổng hợp**

Sinh viên khiếm thính học hòa nhập tại các trường đại học Việt Nam gặp phải sự loại trừ có hệ thống khỏi hai hình thức học tập thiết yếu nhất: giao tiếp thời gian thực trong lớp học trực tiếp và tiếp cận nội dung qua video bài giảng. Điều này dẫn đến khoảng cách kiến thức tích lũy ngày càng lớn so với bạn học có thính giác và trải nghiệm học tập bị động, phụ thuộc hoàn toàn vào sự hỗ trợ thủ công của người khác thay vì được trao quyền tự chủ.

## **2\. Đối tượng hướng tới (Target Audience)**

* **Persona chính:** Sinh viên khiếm thính học hòa nhập (độ tuổi 18–30), đang học tại các trường đại học công lập hoặc tư thục thông thường.  
* **Đặc điểm:** Có thể dùng ngôn ngữ ký hiệu Việt Nam (VSL) ở mức độ khác nhau, một số dựa vào đọc môi \+ viết, một số dùng thiết bị hỗ trợ nghe.  
* **Pain points chính:** Không tham gia được thảo luận nhóm, học qua video thiếu phụ đề chính xác, dễ hiểu sai kiến thức.

## 

## 

## 

## **3\. Phân tích tính Khả quan (Viability)**

| Điểm mạnh (Pros) | Thách thức (Cons & Rủi ro) |
| ----- | ----- |
| \*   Pain point thực tế, cấp bách, tạo impact xã hội mạnh. | \*   Độ chính xác ASR trong lớp học ồn ào và accent vùng miền. |
| \*   Giải pháp (Real-time ASR \+ Bullet Summary) cực kỳ phù hợp. | \*   Dataset ngôn ngữ ký hiệu (VSL) còn hạn chế cho Phase 2\. |
| \*   Tiềm năng hợp tác với World Bank, UNICEF, Sở GD&ĐT. | \*   Cần tối ưu chi phí vì đối tượng người dùng thường có thu nhập thấp. |

## **4\. User Stories (10 Stories chính)**

1. **Lớp học:** Sinh viên muốn chuyển lời giáo viên thành text hiển thị lớn trên màn hình chung.  
2. **Cá nhân:** Sinh viên muốn caption hiển thị trên thiết bị cá nhân (laptop/mobile) để tập trung.  
3. **Đa người nói:** Sinh viên muốn nhận diện text khi nhiều người nói trong thảo luận nhóm.  
4. **Giảng viên:** Giảng viên muốn điều chỉnh font/size/màu caption để hỗ trợ sinh viên tốt hơn.  
5. **Video:** Sinh viên muốn tạo phụ đề thời gian thực khi xem video bài giảng (YouTube, Zoom, MP4).  
6. **Tóm tắt:** Sinh viên muốn hệ thống tóm tắt nội dung thành bullet points mỗi 1-2 phút video.  
7. **Lưu trữ:** Sinh viên muốn xuất transcript đầy đủ \+ bullet summary để ôn bài.  
8. **Ngôn ngữ:** Người dùng muốn hỗ trợ tiếng Việt.  
9. **UX:** Sinh viên muốn giao diện đơn giản, tương thích screen reader.  
10. **Tính ổn định:** Quản trị viên muốn hệ thống chạy offline hoặc ít phụ thuộc internet.

| Tính năng | Core (MVP) | Nice-to-have | Phase 2 |
| ----- | ----- | ----- | ----- |
| Real-time Speech-to-Text (ASR) cho giáo viên nói |  | ✅ |  |
| Hiển thị caption lớn trên màn hình chung / cá nhân | ✅ |  |  |
| Caption cho video bài giảng (upload hoặc URL) | ✅ |  |  |
| Tóm tắt bullet point sau mỗi đoạn video | ✅ |  |  |
| Hỗ trợ multi-speaker detection |  | ✅ |  |
| Export transcript \+ summary (Markdown/PDF) |  | ✅ |  |
| Nhận diện ngôn ngữ ký hiệu Việt Nam (VSL) |  |  | ✅ (khó) |
| Tích hợp Zoom / Google Meet trực tiếp |  |  | ✅ |
| Offline mode (model nhẹ) |  | ✅ |  |
| Tùy chỉnh font, màu, tốc độ caption |  | ✅ |  |

## **5\. Phân tích Tech Stack cho MVP1. Speech-to-Text (ASR) – Nice to have**

* **Model:** **PhoWhisper (VinAI)** — Model tốt nhất hiện nay cho tiếng Việt (fine-tune trên 844 giờ dữ liệu đa accent).  
  * Có 5 size: tiny/base/small/medium/large.  
  * Khuyến nghị bắt đầu với **PhoWhisper-small** hoặc **medium** cho cân bằng tốc độ/chất lượng.  
* **Real-time streaming:**  
  * Sử dụng **whisper\_streaming** (ufal) hoặc **ViStreamASR** (repo chuyên cho Vietnamese streaming).  
  * Hoặc fork từ repo **sonhm3029/Realtime-Vietnamese-ASR-React-Native-and-Whisper** (đã có backend PhoWhisper \+ frontend).  
* **Thư viện hỗ trợ:** Hugging Face Transformers \+ Faster-Whisper (tối ưu tốc độ).

**2\. Tóm tắt bullet point**

* **Model:** Sử dụng LLM tiếng Việt: **PhoGPT**, **Qwen2.5-Vietnamese**, hoặc **VinAI models**.  
* **Pipeline:** ASR → chunk transcript theo thời gian (VAD \- Voice Activity Detection) → gửi cho LLM với prompt: “Tóm tắt đoạn hội thoại này thành bullet points ngắn gọn, rõ ràng cho sinh viên.”

**3\. Frontend & Hiển thị**

* **Công nghệ:** Web: React.js \+ TailwindCSS (dễ responsive).  
* **Mobile:** React Native (có thể tái sử dụng code từ repo realtime PhoWhisper).  
* **Hiển thị caption:** Large font, high contrast (yellow/white text on dark background), hỗ trợ auto-scroll.

**4\. Backend**

* **Framework:** FastAPI hoặc Flask.  
* **GPU:** Sử dụng CTranslate2 để tối ưu inference PhoWhisper-large.  
* **Deployment:** Docker \+ Hugging Face Spaces (prototype) hoặc VPS có GPU (RunPod, Vast.ai).

**5\. Sign Language (Phase 2\)**

* **Dataset:** **VSL400**, **Multi-VSL** (multi-view, lớn nhất), **VOYA\_VSL**, **photienanh/Vietnamese-Sign-Language-Recognition**.  
* **Model:** MediaPipe \+ Transformer hoặc YOLO-based cho gesture recognition.

## **6\. Kế hoạch Test & Đo lường (WER / MOS) \+ Thiết kế Giao diệnMetrics chính:**

* **WER (Word Error Rate)**: Đo độ chính xác transcription (mục tiêu MVP: \< 12-15% trên dữ liệu thực tế lớp học).  
* **MOS (Mean Opinion Score)**: 1-5 điểm, đánh giá bởi sinh viên khiếm thính về độ dễ đọc, hữu ích của caption và bullet summary.  
* **Latency:** Thời gian từ nói → hiển thị caption (\< 2-3 giây là chấp nhận được).

**Quy trình test:**

1. Thu thập dataset test: 10 video bài giảng Việt Nam \+ 5 buổi ghi âm lớp học thực tế (có sinh viên khiếm thính tham gia nếu có thể).  
2. Tạo **Ground Truth**: Transcript thủ công hoặc dùng PhoWhisper-large làm baseline rồi chỉnh sửa.  
3. Chạy evaluation trên 5-10 file/video:  
   * Tính WER tổng thể và theo loại (giảng viên nói một mình vs thảo luận nhóm).  
   * Đo latency trung bình.  
4. User testing: Mời 3-5 sinh viên khiếm thính thử dùng → điền khảo sát MOS \+ phỏng vấn qualitative (pain points còn lại).  
5. Công cụ: Whisper evaluation script \+ Google Sheet theo dõi (File | WER | Latency | MOS | Ghi chú).

**Thiết kế Giao diện (Mô tả chi tiết)**

**A. Màn hình chính (Web App):**

* **Tab 1: Live Classroom**  
  * Nút “Bắt đầu ghi âm” (webcam \+ mic).  
  * Khu vực caption lớn chiếm 70% màn hình: text to trắng/vàng trên nền đen, font sans-serif size 28-40px, line spacing cao.  
  * Bên phải: Bullet summary cập nhật mỗi 60-90 giây.  
  * Điều chỉnh: Size chữ, màu nền, tốc độ cuộn.  
* **Tab 2: Xử lý Video**  
  * Ô upload file hoặc nhập link YouTube/Zoom.  
  * Progress bar xử lý.  
  * Output: Video phát lại với caption đồng bộ \+ panel transcript đầy đủ \+ bullet summary.

**B. Thiết kế chung:**

* High contrast (WCAG AA compliant).  
* Hỗ trợ dark mode.  
* Nút bấm lớn, khoảng cách rộng (dễ dùng cho người khuyết tật).  
* Hiển thị trạng thái: “Đang nhận diện…” hoặc “Độ chính xác ước tính: 92%”.

| \# | Feature | User Pain Point | Mô tả chức năng | Cách triển khai thực tế | Demo MVP (4–8 tuần) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | Smart Pre-Lecture Briefing | Không có “mental model” trước giờ học → khó theo kịp | Tóm tắt slide \+ tạo glossary \+ mindmap | Input: PDF/slide Output: JSON (summary, key terms) Pipeline: 1\. OCR (nếu scan) → PaddleOCR 2\. Parse layout → LayoutLMv3 / unstructured 3\. Chunk text 4\. LLM summarize \+ extract key terms 5\. Generate mindmap JSON Model: GPT-like API / Llama3 Data: Slide công khai (Coursera, MIT OCW) | Upload 1 file slide → show: \- Summary \- 5 key concepts \- Mindmap dạng tree (React Flow) |
| 2 | Attention Highlighting ⭐ | Không nghe được tone nhấn mạnh | Highlight câu quan trọng real-time | Input: transcript stream Output: text có tag (IMPORTANT, EXAM) Pipeline: 1\. ASR → Whisper streaming 2\. Sliding window text 3\. Classify sentence importance Model: DistilBERT fine-tune / rule-based \+ LLM fallback Data: lecture transcripts (YouTube EDU) | Live transcript → highlight màu các câu quan trọng |
| 3 | Question Detector \+ Rephrase ⭐ | Câu hỏi spoken khó hiểu | Detect \+ rewrite câu hỏi rõ ràng | Input: transcript Output: clean question Pipeline: 1\. Detect question (classifier / rule ?) 2\. Send to LLM → rewrite Model: small classifier \+ GPT API Data: QA datasets | Highlight câu hỏi → click → xem bản rõ hơn |
| 4 | Lecture Timeline Generator ⭐ | Transcript dài, khó follow | Chia bài giảng theo timeline | Input: transcript \+ timestamp Output: segments Pipeline: 1\. Sentence embedding → sentence-transformers 2\. Clustering (KMeans / TextTiling) 3\. Label bằng LLM Model: SBERT \+ GPT Data: lecture video | Upload video → show timeline clickable |
| 5  | Explain Like Visual (ELV) | Text explanation khó hiểu | Giải thích bằng sơ đồ | Input: question Output: diagram \+ steps Pipeline: 1\. LLM generate structured steps 2\. Convert → diagram (Mermaid / graph) Model: GPT \+ diagram tool Data: none | Ask question → show diagram |

