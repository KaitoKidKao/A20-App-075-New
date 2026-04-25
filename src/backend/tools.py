import logging
import os
from typing import List, Dict, Any, Optional
from src.backend import config
from src.backend.services.file_service import FileService
from src.backend.services.ocr_service import chandra_ocr, hunyuan_ocr, OCRModelManager

logger = logging.getLogger(__name__)

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
        import httpx
        resp = httpx.get(url, timeout=10, follow_redirects=True)
        return resp.text[:2000]
    except Exception as e:
        return f"Error: {e}"

def extract_pdf(file_path: str, **kwargs) -> str:
    """Extract text from PDF using FileService."""
    return FileService.extract_text_from_pdf(file_path)

def extract_docx(file_path: str) -> str:
    """Extract text from DOCX using FileService."""
    return FileService.extract_text_from_docx(file_path)

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
    
    for k, v in args.items():
        if isinstance(v, str) and v.lower() in ("true", "false"):
            args[k] = v.lower() == "true"
            
    return tool["fn"](**args)
