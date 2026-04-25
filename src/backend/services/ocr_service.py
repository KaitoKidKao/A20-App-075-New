import logging
import httpx
import os
from typing import Any
from src.backend import config

logger = logging.getLogger(__name__)

# Lazy imports cho heavy libraries
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
            try:
                dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
                processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
                model = AutoModel.from_pretrained(
                    model_id, 
                    torch_dtype=dtype,
                    device_map="auto" if torch.cuda.is_available() else None,
                    trust_remote_code=True
                )
                if not torch.cuda.is_available():
                    model = model.to("cpu")
                model.eval()
                cls._models[model_id] = (model, processor)
            except Exception as e:
                logger.error(f"❌ [OCR] Lỗi khi nạp model {model_id}: {e}")
                return None, None
        return cls._models[model_id]

def chandra_ocr(image_source: Any, mode: str = "api") -> str:
    """Trích xuất văn bản sử dụng Chandra OCR."""
    if mode == "api":
        if not config.CHANDRA_API_KEY:
            return "[Chandra OCR API Mock] Thiếu API Key."
        try:
            headers = {"X-API-Key": config.CHANDRA_API_KEY}
            files = {"file": ("image.png", image_source, "image/png")} if isinstance(image_source, bytes) else {"file": open(image_source, "rb")}
            api_url = "https://www.datalab.to/api/v1/convert"
            with httpx.Client(timeout=60.0) as client:
                response = client.post(api_url, files=files, headers=headers)
                response.raise_for_status()
                initial_result = response.json()
                request_check_url = initial_result.get("request_check_url")
                if not request_check_url: return initial_result.get("markdown", "Error")
                
                import time
                for _ in range(30):
                    res = client.get(request_check_url, headers=headers).json()
                    if res.get("status") == "complete": return res.get("markdown", "No content")
                    if res.get("status") == "error": return f"Error: {res.get('error')}"
                    time.sleep(2)
                return "Timeout"
        except Exception as e:
            return f"Error: {e}"
    
    model_id = "datalab-to/chandra-ocr-2"
    model, processor = OCRModelManager.get_model(model_id)
    return f"[Chandra OCR Local] Mode {model_id}" if model else "[Chandra Local Error]"

def hunyuan_ocr(image_source: Any) -> str:
    """Extract text using HunyuanOCR."""
    model_id = "tencent/HunyuanOCR"
    model, _ = OCRModelManager.get_model(model_id)
    return f"[HunyuanOCR Local] Success" if model else f"[HunyuanOCR Mock]"
