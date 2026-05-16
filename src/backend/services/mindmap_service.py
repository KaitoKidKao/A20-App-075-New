import logging
import json
from typing import Any, Dict
from sqlmodel import Session, select
from ..models import Lesson, ContentMetadata
from .ai_service import AIService

logger = logging.getLogger(__name__)

class MindmapService:
    @staticmethod
    async def generate_mindmap(session: Session, lesson_id: str) -> Dict[str, Any]:
        """
        Sinh cấu trúc Mindmap JSON từ nội dung bài học.
        """
        # 1. Kiểm tra cache trong DB
        metadata = session.exec(
            select(ContentMetadata).where(ContentMetadata.lesson_id == lesson_id)
        ).first()
        
        if metadata and metadata.ai_analysis and "mindmap" in metadata.ai_analysis:
            logger.info(f"📍 Found cached mindmap for lesson {lesson_id}")
            return metadata.ai_analysis["mindmap"]

        # 2. Lấy dữ liệu bài học (Transcript)
        lesson = session.get(Lesson, lesson_id)
        if not lesson:
            raise ValueError("Không tìm thấy bài học.")

        # Lấy transcript (giả sử đã được xử lý bởi AIService.transcribe)
        transcript_path = AIService.TRANSCRIPT_DIR / f"{lesson_id}.json"
        if not transcript_path.exists():
            # Nếu chưa có transcript, thử sinh ra nếu file video tồn tại (hoặc báo lỗi)
            logger.warning(f"⚠️ Transcript not found for {lesson_id}")
            return {"name": "Không có dữ liệu transcript", "children": []}

        with open(transcript_path, "r", encoding="utf-8") as f:
            transcript_data = json.load(f)

        # 3. Gọi LLM để sinh Mindmap
        logger.info(f"🧠 Generating mindmap for lesson {lesson_id} using LLM...")
        mindmap_data = await MindmapService._call_llm_for_mindmap(transcript_data)

        # 4. Lưu vào Database
        if not metadata:
            metadata = ContentMetadata(lesson_id=lesson_id, ai_analysis={})
            session.add(metadata)
        
        if metadata.ai_analysis is None:
            metadata.ai_analysis = {}
            
        # Update JSON field
        new_analysis = dict(metadata.ai_analysis)
        new_analysis["mindmap"] = mindmap_data
        metadata.ai_analysis = new_analysis
        
        session.add(metadata)
        session.commit()
        session.refresh(metadata)

        return mindmap_data

    @staticmethod
    async def _call_llm_for_mindmap(transcript_data: dict) -> Dict[str, Any]:
        """
        Logic prompt chuyên biệt để trích xuất cấu trúc cây.
        """
        from .. import config
        from openai import AsyncOpenAI

        api_key = config.OPENAI_API_KEY
        if not api_key:
            return {"name": "Lỗi: Chưa cấu hình API Key", "children": []}

        client = AsyncOpenAI(api_key=api_key)
        
        full_text = " ".join([s["text"] for s in transcript_data.get("segments", [])])
        truncated_text = full_text[:6000]

        prompt = f"""
        Bạn là một chuyên gia tóm tắt kiến thức dưới dạng sơ đồ tư duy (Mindmap). 
        Dựa trên nội dung bài giảng dưới đây, hãy trích xuất một cấu trúc cây (Hierarchical JSON) phản ánh logic bài học.

        Yêu cầu:
        1. Node gốc (Root) là tiêu đề bài giảng hoặc chủ đề chính.
        2. Các node con (Children) là các ý chính, khái niệm quan trọng hoặc các phần của bài giảng.
        3. Phân cấp tối đa 3-4 tầng để đảm bảo tính trực quan.
        4. Trả về DUY NHẤT một đối tượng JSON theo cấu trúc:
           {{
             "name": "Tên node",
             "children": [ {{ "name": "...", "children": [...] }}, ... ]
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
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"❌ Error calling LLM for mindmap: {e}")
            return {"name": "Lỗi khi sinh sơ đồ", "children": []}
