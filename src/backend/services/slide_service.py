import logging
import json
import os
import copy
import random
import uuid
from pathlib import Path
from typing import Any, Dict, List
from pptx import Presentation
from pptx.util import Inches
from sqlmodel import Session, select
from ..models import Lesson, ContentMetadata
from .ai_service import AIService
from .. import config

logger = logging.getLogger(__name__)

class SlideService:
    TEMPLATES_DIR = Path("src/backend/assets/slide_templates")
    OUTPUT_DIR = Path("data/uploads/slides")

    @staticmethod
    async def generate_slides(session: Session, lesson_id: str, template_id: str, num_slides: int = 10) -> Dict[str, Any]:
        """
        Quy trình tạo slide: LLM sinh nội dung -> Lắp vào template -> Lưu trữ.
        """
        # 1. Kiểm tra template tồn tại
        template_path = SlideService.TEMPLATES_DIR / f"{template_id}.pptx"
        if not template_path.exists():
            # Nếu không tìm thấy, dùng template mặc định đầu tiên trong thư mục
            templates = list(SlideService.TEMPLATES_DIR.glob("*.pptx"))
            if not templates:
                raise ValueError(f"Không tìm thấy template tại {SlideService.TEMPLATES_DIR}")
            template_path = templates[0]
            template_id = template_path.stem

        # 2. Lấy dữ liệu bài học
        lesson = session.get(Lesson, lesson_id)
        if not lesson:
            raise ValueError("Không tìm thấy bài học.")

        transcript_path = AIService.TRANSCRIPT_DIR / f"{lesson_id}.json"
        if not transcript_path.exists():
            raise ValueError("Chưa có transcript để tạo slide.")

        with open(transcript_path, "r", encoding="utf-8") as f:
            transcript_data = json.load(f)

        # 3. Gọi LLM sinh nội dung cho N slide
        logger.info(f"🧠 LLM đang soạn nội dung cho {num_slides} slides (Lesson: {lesson_id})...")
        slides_content = await SlideService._call_llm_for_slides(transcript_data, num_slides)

        # 4. Tạo file PowerPoint
        SlideService.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_filename = f"{lesson_id}_{uuid.uuid4().hex[:8]}.pptx"
        output_path = SlideService.OUTPUT_DIR / output_filename

        try:
            SlideService._assemble_pptx(template_path, slides_content, output_path)
        except Exception as e:
            logger.error(f"❌ Lỗi khi tạo file PPTX: {e}")
            raise RuntimeError(f"Lỗi khi lắp ghép slide: {str(e)}")

        # 5. Lưu thông tin vào Database (ContentMetadata)
        # Giả sử chúng ta trả về path local hoặc url MinIO. 
        # Ở đây ta trả về thông tin để API router xử lý việc upload MinIO nếu cần.
        
        metadata = session.exec(
            select(ContentMetadata).where(ContentMetadata.lesson_id == lesson_id)
        ).first()
        if not metadata:
            metadata = ContentMetadata(lesson_id=lesson_id, ai_analysis={})
            session.add(metadata)
        
        new_analysis = dict(metadata.ai_analysis or {})
        new_analysis["slides"] = {
            "template_id": template_id,
            "filename": output_filename,
            "generated_at": str(uuid.uuid4()), # Placeholder cho timestamp hoặc id
            "num_slides": len(slides_content)
        }
        metadata.ai_analysis = new_analysis
        session.add(metadata)
        session.commit()

        return {
            "status": "completed",
            "file_path": str(output_path),
            "filename": output_filename,
            "num_slides": len(slides_content)
        }

    @staticmethod
    def _assemble_pptx(template_path: Path, slides_content: List[Dict], output_path: Path):
        """
        Logic lắp ghép nội dung vào PowerPoint.
        Sử dụng Slide 1 cho Title, Slide 10 cho Ending.
        Các slide giữa chọn random layout từ 2-9.
        """
        prs = Presentation(template_path)
        
        # Xóa tất cả slide hiện có trong template để tạo mới từ đầu dựa trên layout
        # (Hoặc có thể tận dụng slide có sẵn nếu template được thiết kế đặc biệt)
        # Ở đây ta sẽ tạo Presentation mới dựa trên các layout của template cũ
        
        def move_slide(pres, old_index, new_index):
            xml_slides = pres.slides._sldIdLst
            slide_id = xml_slides[old_index]
            xml_slides.remove(slide_id)
            xml_slides.insert(new_index, slide_id)

        new_prs = Presentation(template_path)
        num_template_slides = len(new_prs.slides)
        num_needed = len(slides_content)
        
        # TRƯỜNG HỢP 1: Thiếu slide -> Nhân bản thêm
        if num_needed > num_template_slides and num_template_slides > 1:
            closing_slide_idx = num_template_slides - 1
            content_template_indices = list(range(1, num_template_slides - 1))
            if not content_template_indices: content_template_indices = [0]
            
            for _ in range(num_needed - num_template_slides):
                source_idx = random.choice(content_template_indices)
                source_slide = new_prs.slides[source_idx]
                new_slide = new_prs.slides.add_slide(source_slide.slide_layout)
                
                # Copy Background XML
                try:
                    if source_slide._element.bg is not None:
                        new_slide._element.insert(0, copy.deepcopy(source_slide._element.bg))
                except: pass

                # Copy shapes
                for shape in source_slide.shapes:
                    new_el = copy.deepcopy(shape.element)
                    new_slide.shapes._spTree.insert_element_before(new_el, 'p:extLst')
                    
                # Copy relationships
                for rel in source_slide.part.rels.values():
                    if "image" in rel.reltype:
                        try:
                            new_slide.part.rels.get_or_add(rel.reltype, rel._target, rel.rId)
                        except: pass

            move_slide(new_prs, closing_slide_idx, len(new_prs.slides) - 1)

        # TRƯỜNG HỢP 2: Thừa slide -> Xóa bớt ở giữa để giữ slide cuối
        elif num_needed < num_template_slides and num_needed > 1:
            # Xóa các slide từ vị trí num_needed - 1 cho đến sát slide cuối
            # Ví dụ: template 20, cần 10. Xóa index 9 (slide 10) liên tục 10 lần.
            # Slide index 19 (cuối cùng) sẽ tự động trồi lên vị trí index 9.
            num_to_delete = num_template_slides - num_needed
            for _ in range(num_to_delete):
                idx_to_del = num_needed - 1
                rId = new_prs.slides._sldIdLst[idx_to_del].rId
                new_prs.part.drop_rel(rId)
                del new_prs.slides._sldIdLst[idx_to_del]

        final_slides = list(new_prs.slides)

        for i, content in enumerate(slides_content):
            if i >= len(final_slides): break
            slide = final_slides[i]
            
            # 1. Tìm Title
            title_shape = None
            text_shapes = [s for s in slide.shapes if hasattr(s, "text_frame") and len(s.text.strip()) > 0]
            text_shapes.sort(key=lambda s: s.top)
            
            if text_shapes:
                title_shape = text_shapes[0]
            elif slide.shapes.title:
                title_shape = slide.shapes.title

            # 2. Tìm Body
            body_shape = None
            if text_shapes and len(text_shapes) > 1:
                others = text_shapes[1:]
                others.sort(key=lambda s: s.width * s.height, reverse=True)
                body_shape = others[0]
            else:
                for shape in slide.placeholders:
                    if shape.placeholder_format.idx in [1, 2, 3]:
                        body_shape = shape
                        break
            
            # Xóa trắng các ô chữ thừa khác trong template để slide sạch sẽ
            for s in text_shapes:
                if s != title_shape and s != body_shape:
                    try:
                        s.text = ""
                    except: pass
            
            # Điền tiêu đề
            if title_shape:
                tf = title_shape.text_frame
                if tf.paragraphs:
                    p = tf.paragraphs[0]
                    if p.runs:
                        p.runs[0].text = content.get("title", "")
                        for r_idx in range(1, len(p.runs)):
                            r = p.runs[1]
                            r._r.getparent().remove(r._r)
                    else:
                        p.text = content.get("title", "")

            # Điền nội dung
            if body_shape:
                tf = body_shape.text_frame
                if not tf.paragraphs:
                    tf.text = ""
                
                template_p = tf.paragraphs[0]
                points = content.get("content", [])
                p_xml = template_p._p
                parent_elt = p_xml.getparent()
                
                for p in tf.paragraphs:
                    p._p.getparent().remove(p._p)
                
                if isinstance(points, list):
                    for p_text in points:
                        new_p_xml = copy.deepcopy(p_xml)
                        parent_elt.append(new_p_xml)
                        from pptx.text.text import _Paragraph
                        new_p = _Paragraph(new_p_xml, tf)
                        full_text = f"• {p_text}"
                        if new_p.runs:
                            new_p.runs[0].text = full_text
                            for r_idx in range(1, len(new_p.runs)):
                                r = new_p.runs[1]
                                r._r.getparent().remove(r._r)
                        else:
                            new_p.text = full_text
                else:
                    new_p_xml = copy.deepcopy(p_xml)
                    parent_elt.append(new_p_xml)
                    from pptx.text.text import _Paragraph
                    new_p = _Paragraph(new_p_xml, tf)
                    new_p.text = str(points)

        new_prs.save(output_path)

    @staticmethod
    async def _call_llm_for_slides(transcript_data: dict, num_slides: int) -> List[Dict]:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=config.OPENAI_API_KEY)
        
        full_text = " ".join([s["text"] for s in transcript_data.get("segments", [])])
        truncated_text = full_text[:8000]

        prompt = f"""
        Bạn là một chuyên gia soạn thảo bài giảng. Hãy soạn nội dung cho một bộ Slide gồm CHÍNH XÁC {num_slides} trang dựa trên nội dung bài giảng dưới đây.
        
        KHÔNG ĐƯỢC sinh thiếu slide. Nếu nội dung ngắn, hãy chia nhỏ các ý ra nhiều slide.
        
        Yêu cầu:
        1. Trả về DUY NHẤT một mảng JSON có đúng {num_slides} đối tượng. Mỗi đối tượng gồm:
           - "title": Tiêu đề slide.
           - "content": Danh sách các ý chính (mảng các chuỗi, tối đa 5 ý).
        2. Slide 1 phải là slide tiêu đề tổng quát.
        3. Slide cuối cùng (Slide thứ {num_slides}) phải là slide kết luận và cảm ơn.
        4. Nội dung phải cô đọng, súc tích, phù hợp để trình chiếu.
        5. TẤT CẢ NỘI DUNG PHẢI BẰNG TIẾNG VIỆT.

        Nội dung bài giảng:
        {truncated_text}
        """

        try:
            response = await client.chat.completions.create(
                model=config.DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": "Bạn là chuyên gia giáo dục. Trả về JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )
            data = json.loads(response.choices[0].message.content)
            # LLM có thể trả về {"slides": [...]} hoặc trực tiếp mảng
            if isinstance(data, dict):
                return data.get("slides", data.get("items", list(data.values())[0]))
            return data
        except Exception as e:
            logger.error(f"❌ Error generating slide content: {e}")
            return [{"title": "Lỗi", "content": ["Không thể sinh nội dung slide."]}]
