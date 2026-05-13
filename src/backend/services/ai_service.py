import json
import logging
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus

from openai import AsyncOpenAI
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

    @staticmethod
    def build_bilingual_transcript(original_transcript: dict, vi_transcript: dict) -> dict:
        original_language = (original_transcript.get("language") or "").lower() or "unknown"
        original_segments = original_transcript.get("segments", []) or []
        vi_segments = vi_transcript.get("segments", []) or []

        segments_by_language: dict[str, list[dict[str, Any]]] = {"vi": vi_segments}
        if original_language and original_language != "vi":
            segments_by_language[original_language] = original_segments
        elif original_language == "vi":
            segments_by_language["vi"] = original_segments

        return {
            "video_id": vi_transcript.get("video_id") or original_transcript.get("video_id"),
            "language": "vi",
            "source_language": original_language,
            "available_languages": sorted(segments_by_language.keys()),
            "segments": vi_segments,
            "segments_by_language": segments_by_language,
        }

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
            from faster_whisper import WhisperModel
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

        client = AsyncOpenAI(api_key=api_key)
        
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
            response = await client.chat.completions.create(
                model=config.DEFAULT_MODEL, 
                messages=[
                    {"role": "system", "content": "Bạn là trợ lý giáo dục chuyên nghiệp. Bạn CHỈ ĐƯỢC PHÉP tóm tắt bằng TIẾNG VIỆT."},
                    {"role": "user", "content": prompt}
                ],
                max_completion_tokens=500
            )
            
            summary_text = response.choices[0].message.content
            bullet_points = [line.strip() for line in summary_text.split("\n") if line.strip().startswith("-")]
            
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

        client = AsyncOpenAI(api_key=api_key)
        
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
            response = await client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": "Bạn là chuyên gia phân tích giáo dục. Bạn CHỈ ĐƯỢC PHÉP trả lời bằng TIẾNG VIỆT."},
                    {"role": "user", "content": prompt}
                ],
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

    @staticmethod
    def _gloss_key_forms(raw: str) -> set[str]:
        """Các biến thể so khớp từ gloss: gốc, gạch dưới, khoảng trắng."""
        s = (raw or "").strip().lower()
        if not s:
            return set()
        spaced = s.replace("_", " ").strip()
        underscored = s.replace(" ", "_").strip()
        return {x for x in {s, spaced, underscored} if x}

    @classmethod
    def _resolve_vsl_entry(
        cls,
        raw_word: str,
        vsl_dict: dict,
        synonyms_map: dict,
    ) -> tuple[str | None, dict | None]:
        """
        Tra từ điển VSL: khớp trực tiếp theo mọi dạng từ, sau đó tra synonyms (canonical -> danh sách).
        Trả về (key_chuẩn_trong_dictionary, vsl_info) hoặc (None, None).
        """
        gloss_forms = cls._gloss_key_forms(raw_word)
        if not gloss_forms:
            return None, None

        for key, info in vsl_dict.items():
            if cls._gloss_key_forms(key) & gloss_forms:
                return key, info

        for main_word, syns in synonyms_map.items():
            if main_word not in vsl_dict:
                continue
            if cls._gloss_key_forms(main_word) & gloss_forms:
                return main_word, vsl_dict[main_word]
            if not isinstance(syns, list):
                continue
            for syn in syns:
                if cls._gloss_key_forms(str(syn)) & gloss_forms:
                    return main_word, vsl_dict[main_word]
        return None, None

    @classmethod
    async def generate_handsign_data(cls, transcript_data: dict) -> list:
        """
        Dịch Transcript sang chuỗi VSL Glosses (Ngôn ngữ ký hiệu Việt Nam) kèm mã HamNoSys.
        """
        api_key = config.OPENAI_API_KEY
        if not api_key:
            return []

        client = AsyncOpenAI(api_key=api_key)
        vsl_data = cls.get_vsl_data()
        vsl_dict = vsl_data.get("dictionary", {})
        
        available_keywords = list(vsl_dict.keys())[:1000]
        
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
        5. Mật độ gloss: trung bình khoảng 1 gloss mỗi 3–8 giây nói (ưu tiên ý chính), tránh liệt kê quá dày hoặc trùng nghĩa liên tiếp. "time" phải trùng mốc [start] của đoạn tương ứng trong input khi có thể.
        
        Input:
        {formatted_text[:4000]}
        
        Chỉ trả về JSON.
        """

        try:
            logger.info(f"🤟 [VSL] Đang dịch transcript sang VSL cho {transcript_data['video_id']}...")
            response = await client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            
            ai_result = json.loads(response.choices[0].message.content)
            raw_glosses = ai_result.get("glosses", []) or ai_result.get("data", [])
            
            final_glosses = []
            synonyms_map = vsl_data.get("synonyms", {})

            for item in raw_glosses:
                raw = item.get("word", "")
                canon, vsl_info = cls._resolve_vsl_entry(raw, vsl_dict, synonyms_map)
                if canon:
                    item["word"] = canon
                item["vsl_info"] = vsl_info
                final_glosses.append(item)

            final_glosses.sort(key=lambda x: float(x.get("time", 0) or 0))
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

        client = AsyncOpenAI(api_key=api_key)
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
            response = await client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": "Bạn là trợ lý giáo dục. Bạn CHỈ ĐƯỢC PHÉP trả lời bằng TIẾNG VIỆT."},
                    {"role": "user", "content": prompt}
                ],
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

        client = AsyncOpenAI(api_key=api_key)
        full_text = " ".join([s["text"] for s in transcript_data["segments"]])
        truncated_text = full_text[:6000]

        prompt = f"""
        HÃY CHÚ Ý: BẠN PHẢI TRẢ LỜI BẰNG TIẾNG VIỆT 100%. 
        TUYỆT ĐỐI KHÔNG SỬ DỤNG TIẾNG ANH CHO CÁC TRƯỜNG: "front", "back", "hint", "title", "label", "value", "description", "advanced_detail", "key_takeaways".
        
        Bạn là một chuyên gia thiết kế nội dung giáo dục. Hãy trích xuất danh sách Flashcards và dữ liệu trực quan (Infographic) từ bản ghi chép bài giảng (transcript) dưới đây.

        Yêu cầu QUAN TRỌNG:
        1. TẤT CẢ nội dung (tiêu đề, mô tả, flashcards, key takeaways) PHẢI là tiếng Việt tự nhiên và chính xác.
        2. Flashcards phải giúp sinh viên ôn tập các khái niệm quan trọng nhất.
        3. Dữ liệu trực quan phải làm nổi bật các con số hoặc quy trình cốt lõi.

        Trả về DUY NHẤT một đối tượng JSON theo cấu trúc sau (Lưu ý: TẤT CẢ GIÁ TRỊ PHẢI LÀ TIẾNG VIỆT):
        {{
          "flashcards": [
            {{
              "front": "Câu hỏi ôn tập (tiếng Việt)",
              "back": "Câu trả lời chi tiết (tiếng Việt)",
              "hint": "Gợi ý ngắn gọn (tiếng Việt)"
            }}
          ],
          "visual_data": {{
            "infographic": {{
              "title": "Tiêu đề Infographic (tiếng Việt)",
              "type": "stats" | "process" | "comparison" | "info",
              "category": "technology" | "health" | "finance" | "default",
              "chartType": "pie" | "bar",
              "chartData": [{{"name": "Tên hạng mục (tiếng Việt)", "value": number}}],
              "sections": [{{
                "icon": "Tên icon (chọn từ danh sách gợi ý)",
                "label": "Nhãn mục (tiếng Việt)",
                "value": "Giá trị hoặc tiêu đề phụ (tiếng Việt)",
                "description": "Mô tả chi tiết (tiếng Việt)",
                "advanced_detail": "Thông tin chuyên sâu (tiếng Việt)"
              }}],
              "key_takeaways": ["Ý chính 1 (tiếng Việt)", "Ý chính 2 (tiếng Việt)"],
              "image_prompt": "Mô tả hình ảnh bằng TIẾNG ANH (trường duy nhất được dùng tiếng Anh)"
            }}
          }}
        }}

        Quy tắc quan trọng:
        - TUYỆT ĐỐI KHÔNG chia nội dung theo các cấp độ "Cơ bản", "Trung cấp", "Nâng cao" hoặc "Beginner", "Intermediate", "Advanced".
        - TẤT CẢ văn bản hiển thị cho người dùng (front, back, title, label, value, description, key_takeaways) PHẢI LÀ TIẾNG VIỆT.
        - Chỉ có trường "image_prompt" là viết bằng TIẾNG ANH.
        - Tạo 5-10 flashcards (tiếng Việt).
        - Chỉ sử dụng thông tin có trong transcript. Không tự bịa ra số liệu.
        - Bỏ qua chartData nếu transcript không có dữ liệu định lượng hoặc phân loại rõ ràng.

        Ví dụ mẫu (JSON):
        {{
          "flashcards": [
            {{"front": "Học máy (Machine Learning) là gì?", "back": "Là một lĩnh vực của AI cho phép hệ thống học từ dữ liệu.", "hint": "Khả năng tự học"}}
          ],
          "visual_data": {{
            "infographic": {{
              "title": "Tác động của Công nghệ AI",
              "type": "info",
              "category": "technology",
              "chartType": "bar",
              "chartData": [],
              "sections": [
                {{
                  "icon": "Zap",
                  "label": "Tốc độ xử lý",
                  "value": "Nhanh hơn 50%",
                  "description": "AI giúp tự động hóa các tác vụ lặp lại.",
                  "advanced_detail": "Phân tích chi tiết về hiệu suất quy trình công việc."
                }}
              ],
              "key_takeaways": ["AI là tương lai của ngành công nghiệp", "Dữ liệu là cốt lõi"],
              "image_prompt": "Futuristic AI technology workspace, high-tech classroom, flat design"
            }}
          }}
        }}

        Bản ghi chép (Transcript):
        {truncated_text}
        """

        try:
            logger.info(f"🧠 [Notebook LLM] Đang trích xuất dữ liệu trực quan & Flashcards cho {transcript_data['video_id']}...")
            response = await client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": "Bạn là chuyên gia giáo dục. Bạn CHỈ ĐƯỢC PHÉP trả lời bằng TIẾNG VIỆT. Tuyệt đối không dùng tiếng Anh cho các nội dung hiển thị."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )
            
            result = json.loads(response.choices[0].message.content)
            
            visual_data = result.get("visual_data", {})
            infographic = visual_data.get("infographic", {})
            image_prompt = (
                infographic.get("image_prompt")
                or visual_data.get("image_prompt")
                or "educational classroom infographic illustration"
            ).strip()
            safe_prompt = quote_plus(image_prompt)
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

    @classmethod
    async def translate_transcript_to_vi(cls, transcript_data: dict) -> dict:
        api_key = config.OPENAI_API_KEY
        if not api_key:
            return transcript_data

        client = AsyncOpenAI(api_key=api_key)
        segments = transcript_data.get('segments', [])
        if not segments:
            return transcript_data

        logger.info(f'🌐 Đang dịch transcript của {transcript_data.get("video_id", "")} sang tiếng Việt...')
        full_text = "\n".join([f"[{i}] {s['text']}" for i, s in enumerate(segments)])
        
        prompt = f"""
        Bạn là một biên dịch viên chuyên nghiệp. Hãy dịch các câu hội thoại sau sang tiếng Việt tự nhiên, phù hợp với ngữ cảnh giáo dục.
        Trả về ĐÚNG định dạng ban đầu, chỉ thay đổi phần văn bản thành tiếng Việt. Giữ nguyên các index.
        
        Văn bản gốc:
        {full_text}
        """

        try:
            response = await client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=2000
            )
            
            translated_text = response.choices[0].message.content
            translated_dict = {}
            for line in translated_text.split("\n"):
                line = line.strip()
                if line.startswith("[") and "]" in line:
                    idx_str = line[1:line.find("]")]
                    if idx_str.isdigit():
                        translated_dict[int(idx_str)] = line[line.find("]")+1:].strip()
            
            translated_segments = []
            for i, s in enumerate(segments):
                new_s = s.copy()
                if i in translated_dict:
                    new_s['text'] = translated_dict[i]
                translated_segments.append(new_s)
                
            new_transcript_data = transcript_data.copy()
            new_transcript_data['segments'] = translated_segments
            new_transcript_data['language'] = 'vi'
            
            video_id = transcript_data.get('video_id')
            if video_id:
                transcript_path = cls.TRANSCRIPT_DIR / f"{video_id}.json"
                with open(transcript_path, 'w', encoding='utf-8') as f:
                    json.dump(new_transcript_data, f, ensure_ascii=False, indent=2)
            
            logger.info('✅ Dịch xong transcript sang tiếng Việt.')
            return new_transcript_data
            
        except Exception as e:
            logger.error(f'❌ Lỗi khi dịch transcript: {e}')
            return transcript_data

    @classmethod
    async def translate_transcript_to_language_json(
        cls,
        transcript_data: dict,
        target_language: str,
    ) -> dict:
        target = (target_language or "").strip().lower()
        if target not in {"vi", "en"}:
            return transcript_data

        source = (transcript_data.get("language") or "").strip().lower()
        if source == target:
            return transcript_data

        api_key = config.OPENAI_API_KEY
        if not api_key:
            return transcript_data

        segments = transcript_data.get("segments", [])
        if not segments:
            return transcript_data

        client = AsyncOpenAI(api_key=api_key)
        logger.info(
            "Translating transcript to %s for video_id=%s",
            target,
            transcript_data.get("video_id", ""),
        )

        if target == "vi":
            translator_system = "Bạn là biên dịch viên chuyên nghiệp. Dịch chính xác sang tiếng Việt tự nhiên và mang tính học thuật."
            translator_user = (
                "Dịch nội dung bài giảng sang tiếng Việt tự nhiên. "
                "Trả về DUY NHẤT đối tượng JSON với khóa 'items'. "
                "Mỗi mục: {index:number, text:string}. Giữ nguyên index."
            )
        else:
            translator_system = "You are a professional translator. Translate accurately to natural English."
            translator_user = (
                "Translate to natural English for educational content. "
                "Return only JSON object with key 'items'. "
                "Each item: {index:number, text:string}. Keep index unchanged."
            )

        try:
            async def _translate_chunk(chunk_start: int, chunk_segments: list[dict], max_retry: int = 2) -> list[dict]:
                payload = [
                    {
                        "index": chunk_start + idx,
                        "start": seg.get("start"),
                        "end": seg.get("end"),
                        "text": seg.get("text", ""),
                    }
                    for idx, seg in enumerate(chunk_segments)
                ]
                last_error = None
                for _ in range(max_retry + 1):
                    try:
                        response = await client.chat.completions.create(
                            model=config.DEFAULT_MODEL,
                            messages=[
                                {"role": "system", "content": translator_system},
                                {
                                    "role": "user",
                                    "content": (
                                        f"{translator_user}\n"
                                        "Do not merge or drop rows. Return exactly the same number of items as input.\n\n"
                                        f"Input JSON:\n{json.dumps(payload, ensure_ascii=False)}"
                                    ),
                                },
                            ],
                            response_format={"type": "json_object"},
                        )
                        parsed = json.loads(response.choices[0].message.content)
                        items = parsed.get("items", [])
                        if len(items) != len(chunk_segments):
                            raise ValueError("Translated item count mismatch")

                        out: list[dict] = []
                        for idx, seg in enumerate(chunk_segments):
                            expected_index = chunk_start + idx
                            item = items[idx]
                            got_index = int(item.get("index")) if item.get("index") is not None else None
                            if got_index != expected_index:
                                raise ValueError(f"Index mismatch: expected {expected_index}, got {got_index}")
                            translated_text = str(item.get("text", "")).strip()
                            if not translated_text:
                                raise ValueError(f"Empty translation at index {expected_index}")
                            out.append(
                                {
                                    "start": seg.get("start"),
                                    "end": seg.get("end"),
                                    "text": translated_text,
                                }
                            )
                        return out
                    except Exception as ex:
                        last_error = ex
                raise RuntimeError(f"Chunk translation failed at start={chunk_start}: {last_error}")

            chunk_size = 20
            translated_segments: list[dict] = []
            for i in range(0, len(segments), chunk_size):
                chunk = segments[i : i + chunk_size]
                translated_chunk = await _translate_chunk(i, chunk)
                translated_segments.extend(translated_chunk)

            result = transcript_data.copy()
            result["segments"] = translated_segments
            result["language"] = target
            return result
        except Exception as e:
            logger.error("Translate transcript to %s failed: %s", target, e)
            return transcript_data

    @classmethod
    async def generate_handsign_from_text(cls, text: str) -> list:
        api_key = config.OPENAI_API_KEY
        if not api_key:
            return []

        client = AsyncOpenAI(api_key=api_key)
        vsl_data = cls.get_vsl_data()
        vsl_dict = vsl_data.get('dictionary', {})
        
        available_keywords = list(vsl_dict.keys())[:1000]
        keywords_str = ', '.join(available_keywords[:50])

        prompt = f"""
        Bạn là chuyên gia Ngôn ngữ ký hiệu Việt Nam (VSL). Hãy chuyển đổi nội dung tóm tắt dưới đây sang danh sách các từ khóa VSL (Glosses).
        
        Yêu cầu:
        1. Trả về định dạng JSON: {{"glosses": [{{"time": float, "word": str}}]}}
        2. "word" PHẢI là từ gốc tiếng Việt, viết thường, các từ ghép nối bằng dấu gạch dưới (ví dụ: "công_nghệ", "học_tập").
        3. Chọn lọc những từ CHÍNH, mang ý nghĩa cốt lõi nhất (động từ, danh từ). Bỏ qua các từ nối, mạo từ.
        4. Gợi ý một vài từ trong từ điển VSL: {keywords_str}...
        5. Gán thời gian mô phỏng (time) bắt đầu từ 0.0, tăng dần 0.5s đến 1s cho mỗi từ.

        Nội dung:
        {text}
        """

        try:
            logger.info('🧠 Đang tạo VSL Glosses từ Tóm tắt...')
            response = await client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            
            result_json = json.loads(response.choices[0].message.content)
            raw_glosses = result_json.get('glosses', [])
            
            processed = []
            synonyms_map = vsl_data.get('synonyms', {})
            for g in raw_glosses:
                word = g.get('word')
                if not word: continue
                matched_word, vsl_info = cls._resolve_vsl_entry(word, vsl_dict, synonyms_map)
                processed.append({
                    'time': g.get('time', 0),
                    'word': matched_word or word,
                    'vsl_info': vsl_info
                })
            
            return processed
        except Exception as e:
            logger.error(f'❌ Lỗi khi sinh VSL Glosses từ text: {e}')
            return []
