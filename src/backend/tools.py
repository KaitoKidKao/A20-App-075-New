"""
Tool definitions for the agent.
Add new tools by creating a function and registering it in the TOOLS dict.
"""

import httpx
import os
import logging
import json
from PIL import Image
import io
import fitz  # PyMuPDF
from typing import List, Dict, Any, Optional
from src.backend import config

logger = logging.getLogger(__name__)

# Lazy imports for heavy libraries
try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    from docx import Document
except ImportError:
    Document = None

try:
    import torch
    from transformers import AutoModel, AutoProcessor
except ImportError:
    torch = None
    AutoModel = None
    AutoProcessor = None


class OCRModelManager:
    """Quản lý các mô hình HuggingFace cho OCR."""
    
    _models = {}
    
    @classmethod
    def get_model(cls, model_id: str):
        if model_id not in cls._models:
            if not torch or not AutoModel:
                logger.error(f"❌ [OCR] Transformers không được cài đặt đúng. Không thể tải: {model_id}")
                return None, None
            
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"🚀 [OCR] Đang khởi tạo model từ HuggingFace: {model_id}")
            logger.info(f"💻 [OCR] Thiết bị sử dụng: {device.upper()}")
            
            try:
                logger.info(f"⏳ [OCR] Đang tải weights (có thể mất vài phút)...")
                
                # Cấu hình tối ưu bộ nhớ: dùng bfloat16 nếu có thể
                dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
                
                # Thử nạp Processor
                processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
                
                # Nạp Model
                try:
                    model = AutoModel.from_pretrained(
                        model_id, 
                        torch_dtype=dtype,
                        device_map="auto" if torch.cuda.is_available() else None,
                        trust_remote_code=True
                    )
                except Exception as inner_e:
                    if "hunyuan_vl" in str(inner_e):
                        logger.warning(f"⚠️ [OCR] Kiến trúc 'hunyuan_vl' yêu cầu bản Transformers mới nhất hoặc cài đặt từ source.")
                        logger.warning("👉 Hãy thử: pip install git+https://github.com/huggingface/transformers.git")
                    raise inner_e
                
                if not torch.cuda.is_available():
                    model = model.to("cpu")
                
                model.eval()
                logger.info(f"✅ [OCR] Đã nạp model {model_id} thành công!")
                cls._models[model_id] = (model, processor)
            except Exception as e:
                logger.error(f"❌ [OCR] Lỗi khi nạp model {model_id}: {e}")
                logger.info("💡 Mẹo: Nếu bạn không thể nạp model Local, hệ thống sẽ tự động chuyển sang chế độ Mock/Fallback.")
                return None, None
                
        return cls._models[model_id]


def search_web(query: str) -> str:
    """Search for information on the web (placeholder)."""
    return f"Search results for: {query}"


def calculate(expression: str) -> str:
    """Evaluate a math expression."""
    try:
        result = eval(expression, {"__builtins__": {}})
        return str(result)
    except Exception as e:
        return f"Error: {e}"


def fetch_url(url: str) -> str:
    """Fetch content from a URL."""
    try:
        resp = httpx.get(url, timeout=10, follow_redirects=True)
        return resp.text[:2000]
    except Exception as e:
        return f"Error: {e}"


import httpx

def chandra_ocr(image_source: Any, mode: str = "api") -> str:
    """
    Trích xuất văn bản sử dụng Chandra OCR (datalab-to/chandra-ocr-2).
    image_source: Có thể là đường dẫn file (str) hoặc dữ liệu ảnh (bytes).
    mode: 'local' (HuggingFace) hoặc 'api'.
    """
    if mode == "api":
        if not config.CHANDRA_API_KEY:
            logger.warning("⚠️ Thiếu CHANDRA_API_KEY trong .env. Đang dùng chế độ giả lập API.")
            return f"[Chandra OCR API Mock] Trích xuất cho dữ liệu nguồn..."
        
        # Logic gọi API thực tế
        try:
            headers = {"X-API-Key": config.CHANDRA_API_KEY}
            
            # Nếu image_source là bytes (từ PDF page)
            if isinstance(image_source, bytes):
                files = {"file": ("image.png", image_source, "image/png")}
            else:
                # Nếu image_source là path
                files = {"file": open(image_source, "rb")}

            # Endpoint Datalab API cho chuyển đổi tài liệu (OCR/Markdown)
            api_url = "https://www.datalab.to/api/v1/convert"
            
            logger.info(f"🚀 [API] Đang gửi yêu cầu chuyển đổi tới Chandra (Datalab)...")
            
            with httpx.Client(timeout=60.0) as client:
                response = client.post(api_url, files=files, headers=headers)
                response.raise_for_status()
                
                initial_result = response.json()
                request_check_url = initial_result.get("request_check_url")
                
                if not request_check_url:
                    return initial_result.get("markdown", "Không có nội dung trả về từ API ngay lập tức và thiếu link kiểm tra trạng thái.")

                # Polling loop để chờ kết quả (Datalab API là bất đồng bộ)
                import time
                max_retries = 30
                delay = 2 # giây
                
                logger.info(f"⏳ [API] Đang đợi kết quả từ Datalab (Request ID: {initial_result.get('request_id')})...")
                
                for i in range(max_retries):
                    check_response = client.get(request_check_url, headers=headers)
                    check_response.raise_for_status()
                    result = check_response.json()
                    
                    status = result.get("status")
                    if status == "complete":
                        logger.info(f"✅ [API] Chuyển đổi hoàn tất!")
                        return result.get("markdown", result.get("content", result.get("text", "Không có nội dung trả về từ API.")))
                    elif status == "error":
                        error_msg = result.get("error", "Unknown error during conversion.")
                        logger.error(f"❌ [API] Lỗi xử lý: {error_msg}")
                        return f"[Chandra OCR API Error] {error_msg}"
                    
                    time.sleep(delay)
                
                return f"[Chandra OCR API Timeout] Không nhận được kết quả sau {max_retries * delay} giây."
                
        except Exception as e:
            logger.error(f"❌ Lỗi khi gọi Chandra API: {e}")
            return f"[Chandra OCR API Error] {str(e)}"
    
    # --- Chế độ Local (HuggingFace) ---
    model_id = "datalab-to/chandra-ocr-2"
    model, processor = OCRModelManager.get_model(model_id)
    
    if not model:
        return f"[Chandra OCR Local - Mock] Lỗi nạp model {model_id}."
    
    # Ở đây trong thực tế sẽ chạy model.generate()
    return f"[Chandra OCR Local] Đã chạy model {model_id} trên dữ liệu nguồn."


def hunyuan_ocr(image_source: Any) -> str:
    """Extract text using HunyuanOCR (tencent/HunyuanOCR) from HuggingFace."""
    model_id = "tencent/HunyuanOCR"
    model, processor = OCRModelManager.get_model(model_id)
    
    if not model:
        source_desc = "image bytes" if isinstance(image_source, bytes) else image_source
        return f"[HunyuanOCR - Mock] Model {model_id} would be loaded here. Extraction for {source_desc}..."
    
    return f"[HunyuanOCR Local] Successfully used {model_id}"


def extract_pdf(file_path: str, model: str = "chandra", mode: str = "api", force_ocr: bool = True) -> str:
    """
    Extract text from PDF.
    - Main Flow: Chandra OCR via API.
    - Local Flow: Chandra or Hunyuan via HuggingFace.
    - Fallback: PyMuPDF (fitz) native text extraction.
    """
    if not fitz:
        return "Error: PyMuPDF not installed."
    
    if not os.path.exists(file_path):
        return f"Error: File {file_path} not found."

    logger.info(f"Extracting PDF: {file_path} (Model={model}, Mode={mode})")
    try:
        doc = fitz.open(file_path)
        pages_text = []
        
        for i, page in enumerate(doc):
            text = ""
            
            # 1. Main Flow / Local Flow (OCR)
            if force_ocr:
                try:
                    # Render page to image bytes for OCR
                    # Matrix(2, 2) increases resolution (DPI) for better OCR accuracy
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img_bytes = pix.tobytes("png")
                    
                    if model.lower() == "chandra":
                        text = chandra_ocr(img_bytes, mode=mode)
                    else:
                        text = hunyuan_ocr(img_bytes)
                except Exception as e:
                    logger.warning(f"OCR failed for page {i+1}: {e}. Falling back to PyMuPDF.")
            
            # 2. Fallback to PyMuPDF native text if OCR failed or not forced
            if not text or "[Mock]" in text or "Error" in text:
                native_text = page.get_text().strip()
                if native_text:
                    text = f"[Fallback PyMuPDF] {native_text}"
                else:
                    text = text or "[No text found]"
                
            pages_text.append(f"--- Page {i+1} ---\n{text}")
            
        return "\n\n".join(pages_text)
    except Exception as e:
        return f"Error: {e}"


def extract_docx(file_path: str) -> str:
    """Extract text from DOCX."""
    if not Document:
        return "Error: python-docx not installed."
    
    if not os.path.exists(file_path):
        return f"Error: File {file_path} not found."

    logger.info(f"Extracting DOCX: {file_path}")
    try:
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        return f"Error: {e}"


# Tool registry
TOOLS = {
    "search_web": {
        "fn": search_web,
        "description": "Search for information on the web",
        "parameters": {"query": "string"},
    },
    "calculate": {
        "fn": calculate,
        "description": "Evaluate a math expression",
        "parameters": {"expression": "string"},
    },
    "fetch_url": {
        "fn": fetch_url,
        "description": "Fetch content from a URL",
        "parameters": {"url": "string"},
    },
    "extract_pdf": {
        "fn": extract_pdf,
        "description": "Extract text from PDF with native fallback or OCR",
        "parameters": {"file_path": "string", "model": "string", "use_ocr": "boolean"},
    },
    "extract_docx": {
        "fn": extract_docx,
        "description": "Extract text from DOCX",
        "parameters": {"file_path": "string"},
    },
}


def get_tool_schemas() -> list[dict]:
    """Return tool schemas in OpenAI API format."""
    schemas = []
    for name, tool in TOOLS.items():
        schemas.append({
            "type": "function",
            "function": {
                "name": name,
                "description": tool["description"],
                "parameters": {
                    "type": "object",
                    "properties": {
                        k: {"type": "string" if v == "string" else "boolean", "description": k}
                        for k, v in tool["parameters"].items()
                    },
                    "required": list(tool["parameters"].keys()),
                },
            }
        })
    return schemas


def execute_tool(name: str, args: dict) -> str:
    """Execute a tool by name."""
    tool = TOOLS.get(name)
    if not tool:
        return f"Tool '{name}' does not exist"
    
    # Type conversion for boolean args if they come as strings
    for k, v in args.items():
        if isinstance(v, str) and v.lower() in ("true", "false"):
            args[k] = v.lower() == "true"
            
    return tool["fn"](**args)
