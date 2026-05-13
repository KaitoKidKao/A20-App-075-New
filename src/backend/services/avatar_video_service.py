import logging
import asyncio
import subprocess
import tempfile
import os
import urllib.request
from typing import List, Dict, Any
from pathlib import Path
import json

from src.backend import config

logger = logging.getLogger(__name__)


class AvatarVideoService:
    RESULTS_DIR = Path("data/uploads/ai_results")
    AVATAR_VIDEOS_DIR = Path("data/uploads/avatar_videos")

    @classmethod
    def _build_prompt_for_chunk(cls, chunk_text: str, chunk_glosses: List[str], chunk_index: int) -> str:
        """
        Tạo prompt MÔ TẢ THỊ GIÁC trực tiếp cho mỗi đoạn video 5 giây.
        Tránh meta-prompt (Role/Goal/Instruction) vì model Video AI sẽ vẽ chữ lên màn hình.
        """
        gloss_str = ", ".join(chunk_glosses) if chunk_glosses else chunk_text[:100]

        prompt = (
            "A cinematic, photorealistic video of a Vietnamese female teacher standing in a modern, "
            "well-lit classroom. She is facing the camera directly, medium shot, waist up. "
            "She performs smooth, continuous sign language gestures with her hands. "
            f"The meaning of her gestures conveys: {gloss_str}. "
            "She has a warm, friendly facial expression and professional attire. "
            "Soft studio lighting from the side. Clean background with a whiteboard. "
            "CRITICAL: NO text, NO watermarks, NO subtitles, NO words on screen. "
            "Focus on anatomically correct hands with exactly 5 fingers on each hand. "
            "Static camera. Photorealistic quality."
        )
        return prompt

    @classmethod
    def _split_glosses_into_chunks(cls, glosses: List[Dict[str, Any]], chunk_size: int = 5) -> List[List[str]]:
        """
        Chia danh sách Glosses thành từng nhóm nhỏ (mỗi nhóm ~5 từ = 1 clip 5 giây).
        """
        words = [g.get("word", "") for g in glosses if g.get("word")]
        if not words:
            return [["xin chào"]]  # Fallback

        chunks = []
        for i in range(0, len(words), chunk_size):
            chunk = words[i:i + chunk_size]
            if chunk:
                chunks.append(chunk)

        # Giới hạn tối đa 5 clips (= 25 giây) để tiết kiệm chi phí API
        return chunks[:5]

    @classmethod
    def _download_video(cls, url: str, dest_path: Path) -> bool:
        """Tải video từ URL về local."""
        try:
            logger.info(f"⬇️ Đang tải video từ {url}...")
            urllib.request.urlretrieve(str(url), str(dest_path))
            logger.info(f"✅ Đã tải video về {dest_path}")
            return True
        except Exception as e:
            logger.error(f"❌ Lỗi tải video: {e}")
            return False

    @classmethod
    def _concatenate_videos_ffmpeg(cls, video_paths: List[Path], output_path: Path) -> bool:
        """
        Nối các video clip lại bằng FFmpeg concat demuxer.
        """
        if len(video_paths) == 1:
            # Chỉ có 1 clip, copy trực tiếp
            import shutil
            shutil.copy2(str(video_paths[0]), str(output_path))
            return True

        try:
            # Tạo file list cho FFmpeg concat
            list_file = output_path.parent / "concat_list.txt"
            with open(list_file, "w", encoding="utf-8") as f:
                for vp in video_paths:
                    # FFmpeg concat yêu cầu đường dẫn dùng forward slash
                    safe_path = str(vp.resolve()).replace("\\", "/")
                    f.write(f"file '{safe_path}'\n")

            cmd = [
                "ffmpeg", "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", str(list_file),
                "-c", "copy",
                str(output_path)
            ]

            logger.info(f"🎬 FFmpeg concat: {' '.join(cmd)}")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )

            # Dọn file tạm
            if list_file.exists():
                list_file.unlink()

            if result.returncode != 0:
                logger.error(f"❌ FFmpeg error: {result.stderr}")
                # Nếu concat copy thất bại (codec khác nhau), thử re-encode
                cmd_reencode = [
                    "ffmpeg", "-y",
                    "-f", "concat",
                    "-safe", "0",
                    "-i", str(list_file) if list_file.exists() else "",
                ]
                # Fallback: re-encode từng file
                return cls._concatenate_videos_reencode(video_paths, output_path)

            logger.info(f"✅ Đã nối {len(video_paths)} video thành {output_path}")
            return True

        except Exception as e:
            logger.error(f"❌ Lỗi FFmpeg concat: {e}")
            return False

    @classmethod
    def _concatenate_videos_reencode(cls, video_paths: List[Path], output_path: Path) -> bool:
        """
        Fallback: Nối video bằng cách re-encode (chậm hơn nhưng chắc chắn hoạt động).
        """
        try:
            # Build filter_complex cho concat
            inputs = []
            filter_parts = []
            for i, vp in enumerate(video_paths):
                inputs.extend(["-i", str(vp)])
                filter_parts.append(f"[{i}:v:0][{i}:a:0]")

            filter_str = "".join(filter_parts) + f"concat=n={len(video_paths)}:v=1:a=1[outv][outa]"

            cmd = ["ffmpeg", "-y"] + inputs + [
                "-filter_complex", filter_str,
                "-map", "[outv]", "-map", "[outa]",
                "-c:v", "libx264", "-preset", "fast",
                "-c:a", "aac",
                str(output_path)
            ]

            logger.info(f"🎬 FFmpeg re-encode concat: {len(video_paths)} clips")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

            if result.returncode != 0:
                logger.error(f"❌ FFmpeg re-encode error: {result.stderr[:500]}")
                # Nếu re-encode cũng fail (ví dụ: không có audio), thử chỉ concat video
                return cls._concatenate_video_only(video_paths, output_path)

            return True
        except Exception as e:
            logger.error(f"❌ FFmpeg re-encode error: {e}")
            return False

    @classmethod
    def _concatenate_video_only(cls, video_paths: List[Path], output_path: Path) -> bool:
        """
        Fallback cuối cùng: chỉ nối phần video (không audio).
        """
        try:
            inputs = []
            filter_parts = []
            for i, vp in enumerate(video_paths):
                inputs.extend(["-i", str(vp)])
                filter_parts.append(f"[{i}:v:0]")

            filter_str = "".join(filter_parts) + f"concat=n={len(video_paths)}:v=1:a=0[outv]"

            cmd = ["ffmpeg", "-y"] + inputs + [
                "-filter_complex", filter_str,
                "-map", "[outv]",
                "-c:v", "libx264", "-preset", "fast",
                str(output_path)
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            if result.returncode != 0:
                logger.error(f"❌ FFmpeg video-only concat error: {result.stderr[:500]}")
                return False
            return True
        except Exception as e:
            logger.error(f"❌ FFmpeg video-only error: {e}")
            return False

    @classmethod
    async def generate_avatar_video(cls, video_id: str, text: str, glosses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Sinh nhiều clip video 5s qua Replicate, sau đó nối lại bằng FFmpeg.
        """
        if not config.REPLICATE_API_TOKEN:
            logger.error("REPLICATE_API_TOKEN is not set.")
            return {"error": "API token not configured"}

        try:
            import replicate

            # Chia glosses thành các nhóm nhỏ
            chunks = cls._split_glosses_into_chunks(glosses, chunk_size=5)
            total_clips = len(chunks)

            logger.info(f"🎥 Sẽ sinh {total_clips} clip x 5s = ~{total_clips * 5}s video avatar cho {video_id}")

            # Chuẩn bị thư mục lưu trữ
            result_dir = cls.RESULTS_DIR / video_id
            result_dir.mkdir(parents=True, exist_ok=True)

            cls.AVATAR_VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

            loop = asyncio.get_event_loop()
            clip_paths: List[Path] = []
            clip_urls: List[str] = []

            # Sinh từng clip tuần tự (để tránh rate limit của Replicate)
            for i, chunk_glosses in enumerate(chunks):
                prompt = cls._build_prompt_for_chunk(text, chunk_glosses, i)
                logger.info(f"🎬 [{i+1}/{total_clips}] Đang sinh clip cho: {', '.join(chunk_glosses)}")

                def run_replicate(p=prompt):
                    output = replicate.run(
                        "minimax/video-01",
                        input={
                            "prompt": p,
                            "prompt_optimizer": False
                        }
                    )
                    return output

                video_url = await loop.run_in_executor(None, run_replicate)

                # Xử lý output (có thể là list hoặc string)
                if isinstance(video_url, list) and len(video_url) > 0:
                    video_url = video_url[0]

                video_url_str = str(video_url)
                clip_urls.append(video_url_str)
                logger.info(f"✅ [{i+1}/{total_clips}] Clip sinh thành công: {video_url_str[:80]}...")

                # Tải clip về local
                clip_path = result_dir / f"avatar_clip_{i}.mp4"
                downloaded = await loop.run_in_executor(
                    None, cls._download_video, video_url_str, clip_path
                )

                if downloaded and clip_path.exists():
                    clip_paths.append(clip_path)
                else:
                    logger.warning(f"⚠️ Không tải được clip {i}, bỏ qua.")

            if not clip_paths:
                return {"error": "Không sinh được clip nào."}

            # Nối các clip lại thành 1 video dài
            final_video_path = cls.AVATAR_VIDEOS_DIR / f"{video_id}_avatar.mp4"

            if len(clip_paths) == 1:
                import shutil
                shutil.copy2(str(clip_paths[0]), str(final_video_path))
                success = True
            else:
                success = await loop.run_in_executor(
                    None, cls._concatenate_videos_ffmpeg, clip_paths, final_video_path
                )

            if not success or not final_video_path.exists():
                # Fallback: trả về clip đầu tiên nếu nối thất bại
                logger.warning("⚠️ Nối video thất bại, trả về clip đầu tiên.")
                result = {
                    "video_id": video_id,
                    "avatar_video_url": clip_urls[0] if clip_urls else "",
                    "total_clips": len(clip_urls),
                    "clip_urls": clip_urls,
                    "prompt_used": "multi-clip generation"
                }
            else:
                # Trả về đường dẫn local để frontend serve
                result = {
                    "video_id": video_id,
                    "avatar_video_url": f"/api/avatar-video/{video_id}",
                    "total_clips": len(clip_paths),
                    "total_duration_estimate": f"~{len(clip_paths) * 5}s",
                    "clip_urls": clip_urls,
                    "prompt_used": "multi-clip generation"
                }

            # Lưu cache
            with open(result_dir / "avatar_video.json", "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

            logger.info(f"🎉 Hoàn tất! Video avatar {len(clip_paths)} clips = ~{len(clip_paths)*5}s")
            return result

        except Exception as e:
            logger.error(f"❌ Lỗi khi sinh video avatar qua Replicate: {e}")
            return {"error": str(e)}

    @classmethod
    def get_cached_avatar_video(cls, video_id: str) -> Dict[str, Any]:
        """
        Lấy video avatar đã sinh trước đó từ cache.
        """
        result_dir = cls.RESULTS_DIR / video_id
        file_path = result_dir / "avatar_video.json"

        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return None

    @classmethod
    def get_avatar_video_path(cls, video_id: str) -> Path:
        """Trả về đường dẫn file video avatar đã concat."""
        return cls.AVATAR_VIDEOS_DIR / f"{video_id}_avatar.mp4"
