#!/usr/bin/env python3
"""
Giai đoạn 2 (stub): trích xuất pose từ video cho pipeline handsign thực tế hơn.

- Nếu cài `mediapipe` + `opencv-python`, có thể mở rộng đọc khớp tay và xuất JSON.
- Mặc định: ghi file placeholder để CI / máy dev không cần GPU vẫn chạy được workflow.

Chạy:
  python scripts/extract_pose_stub.py path/to/video.mp4 output/poses.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def try_mediapipe_sample(video_path: Path) -> dict | None:
    try:
        import cv2  # type: ignore
        import mediapipe as mp  # type: ignore
    except ImportError:
        return None

    mp_pose = mp.solutions.pose
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return None

    frames: list[dict] = []
    with mp_pose.Pose(static_image_mode=False) as pose:
        idx = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            if idx % 15 != 0:  # ~1 pose / 0.5s @30fps — giảm dung lượng demo
                idx += 1
                continue
            h, w = frame.shape[:2]
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            res = pose.process(rgb)
            entry: dict = {"frame_index": idx, "time_sec": round(idx / 30.0, 3), "w": w, "h": h}
            if res.pose_landmarks:
                lm = res.pose_landmarks.landmark
                # Chỉ lưu cổ tay trái/phải (normalized) làm stub
                entry["lwrist"] = {"x": lm[15].x, "y": lm[15].y, "z": lm[15].z}
                entry["rwrist"] = {"x": lm[16].x, "y": lm[16].y, "z": lm[16].z}
            frames.append(entry)
            idx += 1
            if idx > 3000:  # giới hạn an toàn
                break
    cap.release()
    return {"schema": "a20-pose-stub/v1", "source": str(video_path), "frames": frames}


def placeholder(video_path: Path) -> dict:
    return {
        "schema": "a20-pose-stub/v1",
        "status": "placeholder",
        "message": "Cài mediapipe + opencv-python để bật trích xuất thật, hoặc nối Blender/Unity.",
        "source": str(video_path),
        "frames": [],
    }


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("video", type=Path)
    p.add_argument("out", type=Path)
    args = p.parse_args()

    if not args.video.is_file():
        print(f"Không tìm thấy file: {args.video}", file=sys.stderr)
        return 1

    data = try_mediapipe_sample(args.video)
    if data is None:
        data = placeholder(args.video)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Đã ghi: {args.out} ({data.get('status') or 'ok'})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
