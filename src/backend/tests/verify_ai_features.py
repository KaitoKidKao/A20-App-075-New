import requests
import os
import json

# Nếu chạy từ gốc dự án, đường dẫn tới data vẫn như cũ
API_BASE = "http://localhost:8000/api/videos"
TRANSCRIPT_DIR = "data/uploads/transcripts"

def verify_features():
    # 1. Tìm một video_id đã có transcript
    if not os.path.exists(TRANSCRIPT_DIR):
        print(f"❌ Thư mục {TRANSCRIPT_DIR} không tồn tại.")
        return

    files = [f for f in os.listdir(TRANSCRIPT_DIR) if f.endswith(".json")]
    if not files:
        print("❌ Không tìm thấy file transcript nào để test. Hãy upload một video trước.")
        return

    video_id = files[0].replace(".json", "")
    print(f"🔍 Đang kiểm tra tính năng AI cho Video ID: {video_id}")

    endpoints = [
        ("Timeline", f"{API_BASE}/{video_id}/timeline"),
        ("Highlights", f"{API_BASE}/{video_id}/highlights"),
        ("Questions", f"{API_BASE}/{video_id}/questions"),
        ("Briefing", f"{API_BASE}/{video_id}/briefing"),
    ]

    for name, url in endpoints:
        print(f"\n--- Testing {name} ---")
        try:
            response = requests.get(url, timeout=60)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Thành công!")
                key = name.lower()
                content = data.get(key, data)
                print(json.dumps(content, indent=2, ensure_ascii=False)[:500] + "...")
            else:
                print(f"❌ Thất bại: HTTP {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"❌ Lỗi kết nối: {e}")
            print("Đảm bảo backend server đang chạy tại http://localhost:8000")

if __name__ == "__main__":
    verify_features()
