import json
import logging
from pathlib import Path
from faster_whisper import WhisperModel
from openai import OpenAI
from src.backend import config

logger = logging.getLogger(__name__)

class AIService:
    TRANSCRIPT_DIR = Path("data/uploads/transcripts")
    AI_RESULTS_DIR = Path("data/uploads/ai_results")
    VSL_DATA_PATH = Path("src/backend/data/vsl_processed.json")
    
    _vsl_data = None

    # Sử dụng bản 'base' hoặc 'small' để tối ưu cho CPU
    MODEL_SIZE = "small"
    
    # Khởi tạo Whisper Model (Lazy Loading)
    _whisper_model = None

    @classmethod
    def get_vsl_data(cls):
        if cls._vsl_data is None:
            if cls.VSL_DATA_PATH.exists():
                with open(cls.VSL_DATA_PATH, "r", encoding="utf-8") as f:
                    cls._vsl_data = json.load(f)
            else:
                logger.warning(f"⚠️ Không tìm thấy file dữ liệu VSL tại {cls.VSL_DATA_PATH}")
                cls._vsl_data = {"dictionary": {}, "synonyms": {}}
        return cls._vsl_data

    @classmethod
    def get_whisper_model(cls):
        if cls._whisper_model is None:
            logger.info(f"🤖 Đang tải mô hình Whisper ({cls.MODEL_SIZE}) trên CPU...")
            # compute_type="int8" giúp chạy nhanh hơn trên CPU mà vẫn giữ độ chính xác ổn
            cls._whisper_model = WhisperModel(cls.MODEL_SIZE, device="cpu", compute_type="int8")
        return cls._whisper_model

    @classmethod
    def transcribe(cls, audio_path: Path, video_id: str) -> dict:
        """
        Chuyển đổi âm thanh thành văn bản kèm timestamp.
        """
        cls.TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)
        transcript_path = cls.TRANSCRIPT_DIR / f"{video_id}.json"
        
        # Nếu đã có transcript rồi thì trả về luôn (Caching)
        if transcript_path.exists():
            with open(transcript_path, "r", encoding="utf-8") as f:
                return json.load(f)

        model = cls.get_whisper_model()
        logger.info(f"🎙️ Đang nhận diện tiếng từ: {audio_path}")
        
        segments, info = model.transcribe(str(audio_path), beam_size=5)
        
        result = {
            "video_id": video_id,
            "language": info.language,
            "segments": []
        }
        
        for segment in segments:
            result["segments"].append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip()
            })
            
        # Lưu kết quả
        with open(transcript_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            
        logger.info(f"✅ Đã tạo xong transcript cho: {video_id}")
        return result

    @classmethod
    async def summarize(cls, transcript_data: dict) -> list:
        """
        Sử dụng LLM để tóm tắt các ý chính từ transcript.
        """
        api_key = config.OPENAI_API_KEY
        if not api_key:
            logger.warning("⚠️ Không tìm thấy OPENAI_API_KEY. Bỏ qua bước tóm tắt.")
            return ["Vui lòng cấu hình API Key để sử dụng tính năng tóm tắt."]

        client = OpenAI(api_key=api_key)
        
        # Kết hợp các đoạn text lại để gửi sang LLM
        full_text = " ".join([s["text"] for s in transcript_data["segments"]])
        
        # Hạn chế độ dài text nếu cần (tùy thuộc vào model và token limit)
        # Ở đây ta lấy khoảng 2000 từ đầu tiên cho đơn giản
        truncated_text = full_text[:4000] 

        prompt = f"""
        Bạn là một trợ lý giáo dục chuyên nghiệp. Hãy tóm tắt nội dung bài giảng dưới đây thành các ý chính (bullet points) ngắn gọn, súc tích và dễ hiểu.
        Định dạng trả về: Chỉ trả về danh sách các bullet points, mỗi ý một dòng bắt đầu bằng dấu "-".
        
        Nội dung transcript:
        {truncated_text}
        """

        try:
            logger.info(f"🧠 Đang gọi LLM ({config.DEFAULT_MODEL}) để tóm tắt nội dung...")
            response = client.chat.completions.create(
                model=config.DEFAULT_MODEL, 
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=500  # Thay max_tokens bằng max_completion_tokens theo thông báo lỗi
            )
            
            summary_text = response.choices[0].message.content
            bullet_points = [line.strip() for line in summary_text.split("\n") if line.strip().startswith("-")]
            
            # Lưu summary vào cùng file transcript hoặc file riêng
            # Ở đây ta giả định trả về để API hiển thị
            return bullet_points
        except Exception as e:
            logger.error(f"❌ Lỗi khi gọi LLM: {e}")
            return [f"Lỗi tóm tắt: {str(e)}"]

    @classmethod
    async def process_all_lecture_metadata(cls, transcript_data: dict) -> dict:
        """
        Batching: Trích xuất Timeline, Highlights và Questions trong 1 lần gọi LLM.
        """
        api_key = config.OPENAI_API_KEY
        if not api_key:
            return {"error": "API Key not configured"}

        client = OpenAI(api_key=api_key)
        
        # Chuẩn bị transcript có kèm timestamp để AI dễ phân tích
        formatted_transcript = ""
        for s in transcript_data["segments"]:
            minutes = int(s["start"] // 60)
            seconds = int(s["start"] % 60)
            formatted_transcript += f"[{minutes:02d}:{seconds:02d}] {s['text']}\n"

        # Giới hạn độ dài để tránh vượt quá context window
        truncated_text = formatted_transcript[:8000]

        prompt = f"""
        Bạn là một chuyên gia phân tích bài giảng. Dựa trên nội dung bài giảng dưới đây (có kèm mốc thời gian), hãy trích xuất các thông tin sau theo định dạng JSON:
        1. "timeline": Danh sách các chủ đề chính. Mỗi chủ đề có "time" (MM:SS) và "title" (tên chủ đề). Hãy chia nhỏ một cách thông minh (Smart Hybrid), dựa trên sự chuyển ý của giảng viên và cố gắng giữ mỗi đoạn khoảng 5-10 phút.
        2. "highlights": Danh sách các khoảnh khắc quan trọng (liên quan đến thi cử, khái niệm cốt lõi, lời dặn của giảng viên). Mỗi mục có "time" (MM:SS), "reason" (tại sao quan trọng) và "context" (đoạn trích ngắn).
        3. "questions": Danh sách các câu hỏi xuất hiện trong bài giảng (từ giảng viên hoặc sinh viên). Hãy viết lại câu hỏi (rephrase) cho rõ ràng hơn. Mỗi mục có "time" (MM:SS), "original" (câu gốc) và "rephrased" (câu đã sửa).

        Định dạng trả về DUY NHẤT là một đối tượng JSON với 3 khóa: "timeline", "highlights", "questions". Không giải thích gì thêm.
        
        Nội dung:
        {truncated_text}
        """

        try:
            logger.info(f"🧠 [Batching] Đang trích xuất Timeline, Highlights & Questions cho {transcript_data['video_id']}...")
            response = client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Caching kết quả
            video_id = transcript_data["video_id"]
            result_dir = cls.AI_RESULTS_DIR / video_id
            result_dir.mkdir(parents=True, exist_ok=True)
            
            with open(result_dir / "metadata.json", "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
                
            return result
        except Exception as e:
            logger.error(f"❌ Lỗi khi trích xuất metadata: {e}")
            return {"error": str(e)}
    @classmethod
    async def generate_handsign_data(cls, transcript_data: dict) -> list:
        """
        Dịch Transcript sang chuỗi VSL Glosses (Ngôn ngữ ký hiệu Việt Nam) kèm mã HamNoSys.
        """
        api_key = config.OPENAI_API_KEY
        if not api_key:
            return []

        client = OpenAI(api_key=api_key)
        vsl_data = cls.get_vsl_data()
        vsl_dict = vsl_data.get("dictionary", {})
        
        # Lấy danh sách 500 từ vựng phổ biến nhất từ từ điển để "gợi ý" cho AI
        available_keywords = list(vsl_dict.keys())[:1000] # Giới hạn để tránh quá tải Prompt
        
        segments = transcript_data["segments"]
        formatted_text = ""
        for s in segments:
            formatted_text += f"[{s['start']}] {s['text']}\n"

        prompt = f"""
        Bạn là chuyên gia Ngôn ngữ ký hiệu Việt Nam (VSL). Hãy dịch đoạn hội thoại dưới đây sang danh sách các từ khóa VSL (Glosses).
        
        Yêu cầu:
        1. Trả về định dạng JSON: {{"glosses": [{{"time": float, "word": str}}]}}
        2. "word" PHẢI là từ gốc tiếng Việt, viết thường, các từ ghép nối bằng dấu gạch dưới (ví dụ: "ăn_cơm", "xin_chào").
        3. Ưu tiên sử dụng các từ khóa sau nếu phù hợp ngữ cảnh: {", ".join(available_keywords[:200])}...
        4. Loại bỏ các từ hư từ, chỉ giữ lại từ mang nội dung chính.
        
        Input:
        {formatted_text[:4000]}
        
        Chỉ trả về JSON.
        """

        try:
            logger.info(f"🤟 [VSL] Đang dịch transcript sang VSL cho {transcript_data['video_id']}...")
            response = client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            
            ai_result = json.loads(response.choices[0].message.content)
            raw_glosses = ai_result.get("glosses", []) or ai_result.get("data", [])
            
            # Làm giàu dữ liệu với HamNoSys
            final_glosses = []
            
            for item in raw_glosses:
                word = item.get("word", "").lower()
                # Thử tra cứu với cả dấu gạch dưới và dấu cách
                word_variants = [word, word.replace(" ", "_"), word.replace("_", " ")]
                
                vsl_info = None
                for variant in word_variants:
                    if variant in vsl_dict:
                        vsl_info = vsl_dict[variant]
                        item["word"] = variant # Cập nhật lại từ chuẩn trong từ điển
                        break
                
                item["vsl_info"] = vsl_info
                final_glosses.append(item)
            
            return final_glosses
        except Exception as e:
            logger.error(f"❌ Lỗi khi sinh Handsign Data: {e}")
            return []


    @classmethod
    async def generate_pre_lecture_briefing(cls, transcript_data: dict) -> dict:
        """
        Tạo bản tóm tắt định hướng trước bài giảng.
        """
        api_key = config.OPENAI_API_KEY
        if not api_key:
            return {"error": "API Key not configured"}

        client = OpenAI(api_key=api_key)
        full_text = " ".join([s["text"] for s in transcript_data["segments"]])
        truncated_text = full_text[:4000]

        prompt = f"""
        Bạn là một trợ lý giáo dục. Dựa trên nội dung bài giảng dưới đây, hãy tạo một bản tóm tắt định hướng (Pre-lecture Briefing) cho sinh viên trước khi xem video.
        Bản tóm tắt bao gồm:
        1. "objective": Mục tiêu chính của bài học này là gì?
        2. "key_terms": Danh sách 3-5 thuật ngữ then chốt sẽ xuất hiện.
        3. "summary": Một đoạn tóm tắt ngắn (3-4 câu) về những gì sinh viên sẽ học được.

        Định dạng trả về DUY NHẤT là JSON với các khóa: "objective", "key_terms", "summary". Không giải thích gì thêm.

        Nội dung:
        {truncated_text}
        """

        try:
            logger.info(f"🧠 Đang tạo Pre-lecture Briefing cho {transcript_data['video_id']}...")
            response = client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Caching
            video_id = transcript_data["video_id"]
            result_dir = cls.AI_RESULTS_DIR / video_id
            result_dir.mkdir(parents=True, exist_ok=True)
            
            with open(result_dir / "briefing.json", "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
                
            return result
        except Exception as e:
            logger.error(f"❌ Lỗi khi tạo briefing: {e}")
            return {"error": str(e)}

    @classmethod
    async def generate_notebook_data(cls, transcript_data: dict) -> dict:
        """
        Tính năng Notebook LLM: Trích xuất dữ liệu trực quan (Charts) và Flashcards.
        """
        api_key = config.OPENAI_API_KEY
        if not api_key:
            return {"error": "API Key not configured"}

        client = OpenAI(api_key=api_key)
        full_text = " ".join([s["text"] for s in transcript_data["segments"]])
        truncated_text = full_text[:6000]

        prompt = f"""
        Bạn là một chuyên gia thiết kế đồ họa thông tin (Infographic) và phân tích dữ liệu. Dựa trên nội dung bài giảng dưới đây, hãy trích xuất dữ liệu để tạo Flashcards và một bộ tài liệu trực quan hóa cao (Infographic & Charts).

        Yêu cầu đầu ra định dạng JSON với các khóa sau:
        1. "flashcards": Danh sách 5-10 thẻ học tập. Mỗi thẻ có "front" (câu hỏi/khái niệm) và "back" (câu trả lời/định nghĩa ngắn gọn).
        2. "visual_data": 
           - "charts": Dữ liệu cho các biểu đồ (topic_distribution, knowledge_density, skills_radar như yêu cầu trước).
           - "infographic": Dữ liệu cho một Infographic chuyên nghiệp bao gồm:
             - "title": Tiêu đề chính của Infographic.
             - "sections": Danh sách 3-5 phần nội dung chính. Mỗi phần có:
               - "icon": Tên icon (ví dụ: 'brain', 'clock', 'target', 'lightbulb', 'star' - dùng chuẩn Lucide/FontAwesome).
               - "label": Tiêu đề của phần.
               - "value": Một số liệu hoặc từ khóa quan trọng nhất.
               - "description": Một đoạn mô tả ngắn (1 câu) giải thích chi tiết hơn.
             - "key_takeaways": 3 điểm rút ra quan trọng nhất từ bài học.
           - "image_prompt": Một mô tả ngắn bằng tiếng Anh (khoảng 10-15 từ) để sinh ảnh minh họa cho bài giảng này (ví dụ: 'A futuristic digital library with holographic data screens, educational style').

        Định dạng trả về DUY NHẤT là JSON. Không giải thích gì thêm.

        Nội dung:
        {truncated_text}
        """

        try:
            logger.info(f"🧠 [Notebook LLM] Đang trích xuất dữ liệu trực quan & Flashcards cho {transcript_data['video_id']}...")
            response = client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Sinh URL ảnh từ Pollinations.ai dựa trên image_prompt
            # Ta lấy từ visual_data.image_prompt hoặc mặc định
            image_prompt = result.get("visual_data", {}).get("image_prompt", "educational illustration")
            safe_prompt = "".join(c if c.isalnum() or c == " " else "" for c in image_prompt).replace(" ", "+")
            result["cover_image_url"] = f"https://image.pollinations.ai/prompt/{safe_prompt}?width=1024&height=768&nologo=true"
            
            # Caching
            video_id = transcript_data["video_id"]
            result_dir = cls.AI_RESULTS_DIR / video_id
            result_dir.mkdir(parents=True, exist_ok=True)
            
            with open(result_dir / "notebook.json", "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
                
            return result
        except Exception as e:
            logger.error(f"❌ Lỗi khi tạo dữ liệu Notebook: {e}")
            return {"error": str(e)}

