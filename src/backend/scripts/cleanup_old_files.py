import os
import shutil
from pathlib import Path

# Cấu hình đường dẫn
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
TRANSCRIPT_DIR = BASE_DIR / "data" / "uploads" / "transcripts"
AI_RESULTS_DIR = BASE_DIR / "data" / "uploads" / "ai_results"

def cleanup():
    print("🧹 Bắt đầu dọn dẹp các file JSON cũ...")
    
    # 1. Dọn dẹp transcripts
    if TRANSCRIPT_DIR.exists():
        json_files = list(TRANSCRIPT_DIR.glob("*.json"))
        print(f"Found {len(json_files)} json files in transcripts.")
        for f in json_files:
            try:
                f.unlink()
                print(f"  - Đã xóa: {f.name}")
            except Exception as e:
                print(f"  - Lỗi khi xóa {f.name}: {e}")
    
    # 2. Dọn dẹp ai_results (các thư mục con chứa json)
    if AI_RESULTS_DIR.exists():
        subdirs = [d for d in AI_RESULTS_DIR.iterdir() if d.is_dir()]
        print(f"Found {len(subdirs)} result directories.")
        for d in subdirs:
            try:
                shutil.rmtree(d)
                print(f"  - Đã xóa thư mục: {d.name}")
            except Exception as e:
                print(f"  - Lỗi khi xóa thư mục {d.name}: {e}")

    print("✨ Hoàn tất dọn dẹp. Dữ liệu hiện tại chỉ tồn tại trong Database.")

if __name__ == "__main__":
    cleanup()
