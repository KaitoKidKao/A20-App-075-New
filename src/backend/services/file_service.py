import os
import logging
import fitz  # PyMuPDF
from docx import Document
from src.backend.services.ocr_service import chandra_ocr, hunyuan_ocr

logger = logging.getLogger(__name__)

class FileService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """
        Trích xuất văn bản từ PDF theo thứ tự ưu tiên:
        1. Chandra API
        2. Local HuggingFace Model
        3. PyMuPDF Fallback
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File không tồn tại: {file_path}")

        logger.info(f"📄 Bắt đầu trích xuất PDF: {file_path}")
        
        try:
            doc = fitz.open(file_path)
            full_text = []
            
            for i, page in enumerate(doc):
                logger.info(f"⏳ Đang xử lý trang {i+1}/{len(doc)}...")
                
                # Render trang thành ảnh để dùng cho OCR (Tầng 1 & 2)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img_bytes = pix.tobytes("png")
                
                text = ""
                
                # --- Tầng 1: Chandra API ---
                try:
                    logger.info("📡 Thử trích xuất bằng Chandra API...")
                    text = chandra_ocr(img_bytes, mode="api")
                    if text and "[Error]" not in text and "[Mock]" not in text:
                        full_text.append(text)
                        continue
                except Exception as e:
                    logger.warning(f"⚠️ Chandra API lỗi ở trang {i+1}: {e}")

                # --- Tầng 2: Local Model (HuggingFace) ---
                try:
                    logger.info("💻 Thử trích xuất bằng Local Model...")
                    # Thử Chandra Local trước, nếu không được thử Hunyuan
                    text = chandra_ocr(img_bytes, mode="local")
                    if not text or "[Mock]" in text:
                        text = hunyuan_ocr(img_bytes)
                    
                    if text and "[Mock]" not in text:
                        full_text.append(text)
                        continue
                except Exception as e:
                    logger.warning(f"⚠️ Local Model lỗi ở trang {i+1}: {e}")

                # --- Tầng 3: PyMuPDF Fallback (Digital Layer) ---
                logger.info("🔌 Quay về giải pháp Fallback: PyMuPDF...")
                native_text = page.get_text().strip()
                if native_text:
                    full_text.append(native_text)
                else:
                    full_text.append(f"[Trang {i+1} không có nội dung văn bản]")

            return "\n\n".join(full_text)
            
        except Exception as e:
            logger.error(f"❌ Lỗi nghiêm trọng khi xử lý PDF: {e}")
            raise e

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Trích xuất văn bản từ file DOCX."""
        try:
            doc = Document(file_path)
            return "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            logger.error(f"❌ Lỗi khi xử lý DOCX: {e}")
            raise e

    @classmethod
    def extract_text(cls, file_path: str) -> str:
        """Tự động nhận diện định dạng và trích xuất."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return cls.extract_text_from_pdf(file_path)
        elif ext == ".docx":
            return cls.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Định dạng file không hỗ trợ: {ext}")
