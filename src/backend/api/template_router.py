import zipfile
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, FileResponse
from src.backend.services.slide_service import SlideService

router = APIRouter(prefix="/api/videos/templates", tags=["Templates"])

THUMBNAILS_DIR = Path("src/backend/assets/slide_thumbnails")

@router.get("/{template_id}/thumbnail")
def get_template_thumbnail(template_id: str):
    # Try to load the dedicated thumbnail PNG first
    thumbnail_path = THUMBNAILS_DIR / f"{template_id}.png"
    if thumbnail_path.exists():
        return FileResponse(path=thumbnail_path, media_type="image/png")
        
    # Fallback to extracting from the PPTX if the PNG doesn't exist
    template_path = SlideService.TEMPLATES_DIR / f"{template_id}.pptx"
    if not template_path.exists():
        raise HTTPException(status_code=404, detail="Template not found")
        
    try:
        with zipfile.ZipFile(template_path, 'r') as zf:
            for item in zf.namelist():
                if "thumbnail.jpeg" in item or "thumbnail.png" in item:
                    content = zf.read(item)
                    media_type = "image/jpeg" if "jpeg" in item else "image/png"
                    return Response(content=content, media_type=media_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # Fallback to a transparent or placeholder 1x1 image if no thumbnail
    return Response(
        content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b',
        media_type="image/gif"
    )
