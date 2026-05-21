import asyncio
import base64
import logging
import uuid
from pathlib import Path

from openai import OpenAI
import requests

from src.backend import config

logger = logging.getLogger(__name__)


class ImageGenerationService:
    COVERS_DIR = Path(config.UPLOADS_DIR) / "covers"

    @staticmethod
    def _token_pool() -> list[str]:
        tokens = [
            (config.OPENAI_API_KEY or "").strip(),
            (config.OPENAI_API_KEY_BACKUP_1 or "").strip(),
            (config.OPENAI_API_KEY_BACKUP_2 or "").strip(),
        ]
        return [token for token in tokens if token]

    @staticmethod
    def _resolve_size(width: int, height: int) -> str:
        # GPT Image supports: 1024x1024, 1536x1024, 1024x1536, auto
        if width <= 0 or height <= 0:
            return "1024x1024"
        ratio = width / height
        if ratio >= 1.2:
            return "1536x1024"
        if ratio <= 0.83:
            return "1024x1536"
        return "1024x1024"

    @staticmethod
    def _normalize_quality(value: str) -> str:
        q = (value or "").strip().lower()
        if q in {"low", "medium", "high"}:
            return q
        return "low"

    @classmethod
    def _attempt_generate(
        cls,
        *,
        api_key: str,
        prompt: str,
        width: int,
        height: int,
    ) -> str | None:
        client = OpenAI(api_key=api_key)
        size = cls._resolve_size(width, height)
        quality = cls._normalize_quality(config.OPENAI_IMAGE_QUALITY)

        try:
            response = client.images.generate(
                model=config.OPENAI_IMAGE_MODEL,
                prompt=prompt,
                size=size,
                quality=quality,
            )
            data = response.data[0] if response.data else None
            b64 = getattr(data, "b64_json", None) if data else None
            if b64:
                return b64

            image_url = getattr(data, "url", None) if data else None
            if image_url:
                url_response = requests.get(image_url, timeout=30)
                url_response.raise_for_status()
                return base64.b64encode(url_response.content).decode("ascii")

            logger.warning("OpenAI image generation returned no image payload.")
            return None
        except Exception as exc:
            logger.warning("OpenAI image generation failed: %s", exc)
            return None

    @classmethod
    def _persist_cover_png(cls, b64_data: str) -> str | None:
        try:
            cls.COVERS_DIR.mkdir(parents=True, exist_ok=True)
            raw_bytes = base64.b64decode(b64_data)
            filename = f"{uuid.uuid4()}.png"
            output_path = cls.COVERS_DIR / filename
            output_path.write_bytes(raw_bytes)
            relative_url = f"/uploads/covers/{filename}"
            from .storage_service import upload_to_s3
            upload_to_s3(output_path, relative_url.lstrip("/"))
            return relative_url
        except Exception as exc:
            logger.warning("Failed to persist generated cover image: %s", exc)
            return None

    @classmethod
    def generate_cover_image_url(
        cls,
        prompt: str,
        *,
        width: int = 1024,
        height: int = 768,
    ) -> str | None:
        normalized_prompt = (prompt or "").strip()
        if not normalized_prompt:
            return None

        keys = cls._token_pool()
        if not keys:
            logger.warning("No OPENAI_API_KEY configured for image generation.")
            return None

        for index, key in enumerate(keys, start=1):
            result_b64 = cls._attempt_generate(
                api_key=key,
                prompt=normalized_prompt,
                width=width,
                height=height,
            )
            if result_b64:
                persisted_url = cls._persist_cover_png(result_b64)
                if not persisted_url:
                    continue
                logger.info("OpenAI image generated successfully with key slot #%d", index)
                return persisted_url

        logger.error("All OpenAI keys failed for image generation.")
        return None

    @classmethod
    async def generate_cover_image_url_async(
        cls,
        prompt: str,
        *,
        width: int = 1024,
        height: int = 768,
    ) -> str | None:
        return await asyncio.to_thread(
            cls.generate_cover_image_url,
            prompt,
            width=width,
            height=height,
        )
