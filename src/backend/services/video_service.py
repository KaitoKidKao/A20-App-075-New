import os
import subprocess
import logging
import asyncio
from pathlib import Path

logger = logging.getLogger(__name__)

class VideoService:
    UPLOAD_DIR = Path("data/uploads/videos")
    AUDIO_DIR = Path("data/uploads/audio")
    
    @classmethod
    def ensure_dirs(cls):
        cls.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        cls.AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    @classmethod
    async def save_video(cls, file_content: bytes, filename: str) -> Path:
        cls.ensure_dirs()
        file_path = cls.UPLOAD_DIR / filename
        async with asyncio.Lock(): # Simple lock for local writing
            with open(file_path, "wb") as f:
                f.write(file_content)
        return file_path

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
            result = subprocess.run(
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
