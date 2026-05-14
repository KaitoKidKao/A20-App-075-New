import ipaddress
import socket
import uuid
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlmodel import Session

from src.backend.models import User, Lesson, Course, Module

def check_video_access(lesson_id: str, user: User, session: Session):
    try:
        lesson_uuid = uuid.UUID(str(lesson_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid video id.")

    lesson = session.get(Lesson, lesson_uuid)
    if not lesson:
        raise HTTPException(status_code=404, detail="Khong tim thay bai hoc.")
    
    # Kiem tra quyen truy cap: Admin hoac Instructor hoac nguoi da dang ky khoa hoc
    # Tam thoi kiem tra don gian: neu la admin thi OK
    if user.role and user.role.name == "Admin":
        return lesson
        
    # Neu la giang vien cua khoa hoc nay thi OK
    course = session.get(Course, lesson.module.course_id)
    if course and course.instructor_id == user.id:
        return lesson
        
    return lesson


def _is_public_ip(ip_str: str) -> bool:
    try:
        ip_obj = ipaddress.ip_address(ip_str)
    except ValueError:
        return False
    return not (
        ip_obj.is_private
        or ip_obj.is_loopback
        or ip_obj.is_link_local
        or ip_obj.is_reserved
        or ip_obj.is_multicast
        or ip_obj.is_unspecified
    )


def validate_external_video_url(raw_url: str) -> str:
    if not raw_url:
        raise HTTPException(status_code=400, detail="Video URL is required.")

    parsed = urlparse(raw_url.strip())
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="Only http/https URLs are allowed.")
    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL.")

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Invalid URL host.")

    lowered = hostname.lower()
    if lowered in {"localhost", "127.0.0.1", "::1"} or lowered.endswith(".local"):
        raise HTTPException(status_code=400, detail="Local addresses are not allowed.")

    try:
        resolved = socket.getaddrinfo(hostname, parsed.port or 443, proto=socket.IPPROTO_TCP)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Unable to resolve URL host.")

    for record in resolved:
        ip = record[4][0]
        if not _is_public_ip(ip):
            raise HTTPException(status_code=400, detail="Target host is not publicly routable.")

    return raw_url.strip()
