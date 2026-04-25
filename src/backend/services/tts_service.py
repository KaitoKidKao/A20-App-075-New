import edge_tts
import asyncio
import logging
import os

logger = logging.getLogger(__name__)

class TTSService:
    DEFAULT_VOICE = "vi-VN-HoaiMyNeural"  # Giọng nữ tiếng Việt truyền cảm
    
    @staticmethod
    async def generate_audio(text: str, output_path: str, voice: str = None):
        """
        Chuyển đổi văn bản thành file âm thanh MP3.
        """
        if not text.strip():
            raise ValueError("Văn bản trống, không thể tạo âm thanh.")
            
        selected_voice = voice or TTSService.DEFAULT_VOICE
        logger.info(f"🎙️ Đang tạo âm thanh với giọng: {selected_voice}")
        
        try:
            communicate = edge_tts.Communicate(text, selected_voice)
            await communicate.save(output_path)
            logger.info(f"✅ Đã lưu file âm thanh tại: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"❌ Lỗi khi tạo âm thanh: {e}")
            raise e

    @classmethod
    def generate_audio_sync(cls, text: str, output_path: str, voice: str = None):
        """Hàm đồng bộ để gọi từ FastAPI nếu cần."""
        return asyncio.run(cls.generate_audio(text, output_path, voice))
