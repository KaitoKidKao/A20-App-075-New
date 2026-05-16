import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlmodel import Session, select
from src.backend.database import get_session
from src.backend.models import User, Video, LectureData
from src.backend.auth import get_current_user
from src.backend.services.video_service import VideoService
from src.backend.services.pipeline import run_video_pipeline, download_and_run_pipeline, processing_status
from src.backend.services.ai_service import AIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/videos", tags=["Videos & Analysis"])

@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Endpoint upload video: Lưu file, tạo record DB và kích hoạt pipeline.
    """
    video_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".mp4", ".mov", ".avi", ".mkv"]:
        raise HTTPException(status_code=400, detail="Định dạng file không hỗ trợ.")
    
    filename = f"{video_id}{ext}"
    
    try:
        # 1. Lưu file video vật lý
        content = await file.read()
        logger.info(f"📥 [{video_id}] Nhận file từ {current_user.email}: {file.filename}")
        video_path = await VideoService.save_video(content, filename)
        
        # 2. Tạo record trong database
        new_video = Video(
            id=video_id,
            user_id=current_user.id,
            title=file.filename,
            storage_path=str(video_path),
            status="queued"
        )
        session.add(new_video)
        session.commit()
        
        # 3. Đưa vào hàng chờ xử lý trong nền
        processing_status[video_id] = "queued"
        background_tasks.add_task(run_video_pipeline, video_id, video_path)
        
        return {
            "video_id": video_id,
            "status": "processing",
            "message": "Video đã được tải lên và đang chờ xử lý."
        }
    except Exception as e:
        logger.error(f"❌ Lỗi upload video {video_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-url")
async def process_url(
    background_tasks: BackgroundTasks, 
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Tiếp nhận URL video, tạo record DB và tải xuống để xử lý.
    """
    url = data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp URL video.")
    
    video_id = str(uuid.uuid4())
    
    # Tạo record ban đầu
    new_video = Video(
        id=video_id,
        user_id=current_user.id,
        title=f"Video từ URL: {url[:30]}...",
        storage_path="", # Sẽ cập nhật sau khi tải xong
        status="queued"
    )
    session.add(new_video)
    session.commit()

    # Đưa vào hàng chờ
    processing_status[video_id] = "queued"
    background_tasks.add_task(download_and_run_pipeline, video_id, url)
    
    return {
        "video_id": video_id,
        "status": "processing",
        "message": "URL đã được nhận và đang chuẩn bị tải xuống."
    }

@router.get("/me")
async def list_my_videos(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy danh sách video của người dùng hiện tại"""
    statement = select(Video).where(Video.user_id == current_user.id)
    videos = session.exec(statement).all()
    return videos

@router.get("/{video_id}/status")
async def get_video_status(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Kiểm tra trạng thái xử lý của video (có kiểm tra quyền)"""
    video = session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Không tìm thấy video.")
    
    # Kiểm tra quyền: Chỉ chủ sở hữu hoặc Admin mới được xem
    if video.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem trạng thái video này.")
        
    return {"video_id": video_id, "status": video.status}

# Helper kiểm tra quyền truy cập dữ liệu bài giảng
def check_video_access(video_id: str, user: User, session: Session):
    video = session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Không tìm thấy video.")
    if video.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập dữ liệu này.")
    return video

@router.get("/{video_id}/transcript")
async def get_transcript(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy kết quả phụ đề (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.transcript:
        return {"video_id": video_id, "message": "Phụ đề chưa sẵn sàng."}
    return lecture.transcript

@router.get("/{video_id}/summary")
async def get_summary(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy tóm tắt (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.summary:
        return {"video_id": video_id, "message": "Tóm tắt chưa sẵn sàng."}
    return {"video_id": video_id, "summary": lecture.summary}

@router.get("/{video_id}/timeline")
async def get_timeline(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy timeline (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.timeline:
        return {"video_id": video_id, "timeline": []}
    return {"video_id": video_id, "timeline": lecture.timeline}

@router.get("/{video_id}/highlights")
async def get_highlights(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy highlights (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.highlights:
        return {"video_id": video_id, "highlights": []}
    return {"video_id": video_id, "highlights": lecture.highlights}

@router.get("/{video_id}/questions")
async def get_questions(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy questions (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.questions:
        return {"video_id": video_id, "questions": []}
    return {"video_id": video_id, "questions": lecture.questions}

@router.get("/{video_id}/briefing")
async def get_briefing(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy briefing (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.briefing:
        return {"video_id": video_id, "message": "Briefing chưa sẵn sàng."}
    return {"video_id": video_id, "briefing": lecture.briefing}

@router.get("/{video_id}/mindmap")
async def get_mindmap(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy mindmap (On-demand)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture:
        return {"video_id": video_id, "message": "Dữ liệu bài giảng chưa sẵn sàng."}
    
    if not lecture.mindmap:
        logger.info(f"🧠 [{video_id}] Mindmap chưa có, đang tạo On-demand...")
        mindmap = await AIService.generate_mindmap(lecture.transcript)
        lecture.mindmap = mindmap
        session.add(lecture)
        session.commit()
        session.refresh(lecture)
        
    return {"video_id": video_id, "mindmap": lecture.mindmap}

@router.get("/{video_id}/quiz")
async def get_quiz(
    video_id: str, 
    num_questions: int = 5,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy quiz (On-demand)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture:
        return {"video_id": video_id, "quiz": []}
    
    if not lecture.quiz:
        logger.info(f"🧠 [{video_id}] Quiz chưa có, đang tạo On-demand ({num_questions} câu)...")
        quiz = await AIService.generate_quiz(lecture.transcript, num_questions=num_questions)
        lecture.quiz = quiz
        session.add(lecture)
        session.commit()
        session.refresh(lecture)
        
    return {"video_id": video_id, "quiz": lecture.quiz}

@router.get("/{video_id}/slides")
async def get_slides(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy slides blueprint (On-demand)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture:
        return {"video_id": video_id, "slides": []}
        
    if not lecture.slides:
        logger.info(f"🧠 [{video_id}] Slides chưa có, đang tạo On-demand...")
        slides = await AIService.generate_slides(lecture.transcript)
        lecture.slides = slides
        session.add(lecture)
        session.commit()
        session.refresh(lecture)
        
    return {"video_id": video_id, "slides": lecture.slides}
