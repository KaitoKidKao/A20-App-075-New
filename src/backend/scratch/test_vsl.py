import asyncio
import json
import os
import sys
from pathlib import Path

# Fix encoding for Windows console
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add project root to path
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

from src.backend.services.ai_service import AIService

async def test_vsl_translation():
    print("Testing VSL Translation...")
    
    # Mock transcript data
    transcript_data = {
        "video_id": "test_vsl_video",
        "segments": [
            {"start": 0.0, "end": 3.5, "text": "Chào các bạn, hôm nay chúng ta sẽ học về trí tuệ nhân tạo."},
            {"start": 3.6, "end": 7.0, "text": "Trí tuệ nhân tạo là một lĩnh vực rất quan trọng trong cuộc sống hiện nay."}
        ]
    }
    
    # Call generate_handsign_data
    results = await AIService.generate_handsign_data(transcript_data)
    
    # Save output for inspection
    output_path = Path("src/backend/data/test_vsl_output.json")
    os.makedirs(output_path.parent, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\nFull results saved to {output_path}")

    print("\n--- Translation Results ---")
    for item in results:
        word = item.get("word")
        time = item.get("time")
        vsl_info = item.get("vsl_info")
        
        status = "Found" if vsl_info else "Not Found"
        print(f"[{time}s] {word}: {status}")

if __name__ == "__main__":
    asyncio.run(test_vsl_translation())
