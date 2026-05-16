import os
import subprocess
import logging
import asyncio
from pathlib import Path
from fastapi import UploadFile
import aiofiles

from src.backend import config

logger = logging.getLogger(__name__)

class VideoService:
    UPLOAD_DIR = Path("data/uploads/videos")
    AUDIO_DIR = Path("data/uploads/audio")
    _write_lock = asyncio.Lock()
    
    @classmethod
    def ensure_dirs(cls):
        cls.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        cls.AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    @classmethod
    async def save_video(cls, file_content: bytes, filename: str) -> Path:
        cls.ensure_dirs()
        file_path = cls.UPLOAD_DIR / filename
        async with cls._write_lock: # Use class-level lock
            with open(file_path, "wb") as f:
                f.write(file_content)
        return file_path

    @classmethod
    async def save_video_stream(
        cls,
        upload_file: UploadFile,
        filename: str,
        max_size_bytes: int,
        chunk_size: int = 1024 * 1024,
    ) -> Path:
        """
        Save uploaded video incrementally to disk to avoid loading full file into memory.
        Raises ValueError if file exceeds max_size_bytes.
        """
        cls.ensure_dirs()
        file_path = cls.UPLOAD_DIR / filename
        total_bytes = 0

        async with cls._write_lock:
            async with aiofiles.open(file_path, "wb") as out_file:
                while True:
                    chunk = await upload_file.read(chunk_size)
                    if not chunk:
                        break
                    total_bytes += len(chunk)
                    if total_bytes > max_size_bytes:
                        await out_file.close()
                        try:
                            file_path.unlink(missing_ok=True)
                        except Exception:
                            pass
                        raise ValueError("Uploaded file exceeds allowed size.")
                    await out_file.write(chunk)

        await upload_file.seek(0)
        return file_path

    @classmethod
    def validate_video_duration(cls, video_path: Path) -> None:
        if not video_path.exists():
            return

        command = [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]
        # Set LD_LIBRARY_PATH to fix potential library issues on this system
        env = os.environ.copy()
        env["LD_LIBRARY_PATH"] = "/usr/lib/x86_64-linux-gnu"

        try:
            result = subprocess.run(command, capture_output=True, text=True, check=True, env=env)
            duration = float((result.stdout or "0").strip() or 0)
        except FileNotFoundError:
            logger.warning("ffprobe is not installed; skipping duration validation for %s", video_path)
            return
        except Exception as exc:
            raise ValueError(f"Unable to validate video duration: {exc}") from exc

        if duration > config.MAX_VIDEO_DURATION_SECONDS:
            try:
                video_path.unlink(missing_ok=True)
            except Exception:
                pass
            raise ValueError("Uploaded video exceeds allowed duration.")

    @classmethod
    async def download_video(cls, url: str, video_id: str) -> Path:
        """
        Tải video từ URL sử dụng yt-dlp.
        """
        cls.ensure_dirs()
        output_template = str(cls.UPLOAD_DIR / f"{video_id}.%(ext)s")
        
        # Cấu hình yt-dlp
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': output_template,
            'quiet': True,
            'no_warnings': True,
        }
        
        import yt_dlp
        
        logger.info(f"🌐 Đang tải video từ URL: {url}")
        
        # Chạy tải video trong ThreadPool vì yt-dlp là sync
        loop = asyncio.get_event_loop()
        def download():
            # Set LD_LIBRARY_PATH for the current process/thread
            os.environ["LD_LIBRARY_PATH"] = "/usr/lib/x86_64-linux-gnu"
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                return Path(ydl.prepare_filename(info))
        
        return await loop.run_in_executor(None, download)

    @classmethod
    def extract_audio(cls, video_path: Path) -> Path:
        """
        Extracts audio from video using FFmpeg.
        Returns the path to the extracted audio file.
        """
        cls.ensure_dirs()
        audio_path = cls.AUDIO_DIR / f"{video_path.stem}.mp3"
        
        # Command to extract audio
        # -i: input file
        # -vn: disable video
        # -acodec libmp3lame: use mp3 codec
        # -y: overwrite output
        command = [
            "ffmpeg", "-i", str(video_path),
            "-vn", "-acodec", "libmp3lame",
            "-y", str(audio_path)
        ]
        
        # Set LD_LIBRARY_PATH to fix potential library issues on this system
        env = os.environ.copy()
        env["LD_LIBRARY_PATH"] = "/usr/lib/x86_64-linux-gnu"
        
        try:
            logger.info(f"🎬 Đang tách âm thanh từ: {video_path}")
            subprocess.run(
                command, 
                capture_output=True, 
                text=True, 
                check=True,
                env=env
            )
            logger.info(f"✅ Tách âm thanh thành công: {audio_path}")
            return audio_path
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Lỗi khi tách âm thanh: {e.stderr}")
            raise Exception(f"FFmpeg error: {e.stderr}")
