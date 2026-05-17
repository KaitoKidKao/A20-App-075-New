import logging
import json
import uuid
from typing import Any, Dict
from sqlmodel import Session, select
from ..models import Lesson, ContentMetadata
from .ai_service import AIService
from .storage_service import ensure_local

logger = logging.getLogger(__name__)


class MindmapService:
    @staticmethod
    async def generate_mindmap(session: Session, lesson_id: str) -> Dict[str, Any]:
        # Parse UUID — fixes string vs UUID column mismatch in PostgreSQL
        try:
            lesson_uuid = uuid.UUID(str(lesson_id))
        except ValueError:
            raise ValueError(f"Invalid lesson id: {lesson_id}")

        # 1. Check cache in DB
        metadata = session.exec(
            select(ContentMetadata).where(ContentMetadata.lesson_id == lesson_uuid)
        ).first()

        if metadata and isinstance(metadata.ai_analysis, dict) and "mindmap" in metadata.ai_analysis:
            logger.info(f"📍 Cached mindmap for lesson {lesson_id}")
            return metadata.ai_analysis["mindmap"]

        # 2. Verify lesson exists
        lesson = session.get(Lesson, lesson_uuid)
        if not lesson:
            raise ValueError("Không tìm thấy bài học.")

        # 3. Load transcript — local first, then S3 fallback
        transcript_path = AIService.TRANSCRIPT_DIR / f"{lesson_id}.json"
        s3_key = f"uploads/transcripts/{lesson_id}.json"
        if not transcript_path.exists():
            logger.info(f"Transcript not local, trying S3: {s3_key}")
            ensure_local(s3_key, transcript_path)

        if not transcript_path.exists():
            logger.warning(f"⚠️ Transcript not found for {lesson_id}")
            return {"topic": "Không có dữ liệu transcript", "branches": []}

        with open(transcript_path, "r", encoding="utf-8") as f:
            transcript_data = json.load(f)

        # 4. Call LLM
        logger.info(f"🧠 Generating mindmap for lesson {lesson_id}...")
        mindmap_data = await MindmapService._call_llm_for_mindmap(transcript_data)

        # 5. Save to DB
        if not metadata:
            metadata = ContentMetadata(lesson_id=lesson_uuid, ai_analysis={})
            session.add(metadata)

        new_analysis = dict(metadata.ai_analysis or {})
        new_analysis["mindmap"] = mindmap_data
        metadata.ai_analysis = new_analysis
        session.add(metadata)
        session.commit()
        session.refresh(metadata)

        return mindmap_data

    @staticmethod
    async def _call_llm_for_mindmap(transcript_data: dict) -> Dict[str, Any]:
        from .. import config
        from openai import AsyncOpenAI

        if not config.OPENAI_API_KEY:
            return {"topic": "Lỗi: Chưa cấu hình API Key", "branches": []}

        client = AsyncOpenAI(api_key=config.OPENAI_API_KEY)

        full_text = " ".join([s["text"] for s in transcript_data.get("segments", [])])
        truncated_text = full_text[:6000]

        prompt = f"""
Bạn là một chuyên gia tóm tắt kiến thức dưới dạng sơ đồ tư duy (Mindmap).
Dựa trên nội dung bài giảng dưới đây, hãy trích xuất một cấu trúc cây phản ánh logic bài học.

Yêu cầu:
1. Node gốc (topic) là tiêu đề bài giảng hoặc chủ đề chính.
2. Các node con (branches) là các ý chính hoặc khái niệm quan trọng.
3. Mỗi nhánh (branch) chứa một mảng các điểm (points). Mỗi point bao gồm nội dung tóm tắt (text) và mốc thời gian (timestamp, định dạng MM:SS hoặc null).
4. Trả về DUY NHẤT một đối tượng JSON theo cấu trúc:
   {{
     "topic": "Tên chủ đề chính",
     "branches": [
       {{
         "name": "Tên nhánh",
         "points": [
           {{ "text": "Nội dung chi tiết 1", "timestamp": "01:23" }},
           {{ "text": "Nội dung chi tiết 2", "timestamp": "02:45" }}
         ]
       }}
     ]
   }}
5. TẤT CẢ NỘI DUNG PHẢI BẰNG TIẾNG VIỆT.

Nội dung bài giảng:
{truncated_text}
"""

        try:
            response = await client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": "Bạn là chuyên gia giáo dục. Chỉ trả về JSON."},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"❌ LLM mindmap error: {e}")
            return {"topic": "Lỗi khi sinh sơ đồ", "branches": []}
