import os
import sys
import logging
import argparse

# Ensure src is in the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.backend.tools import extract_pdf, extract_docx

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

def print_banner(text):
    print("\n" + "="*70)
    print(f" {text.center(68)} ")
    print("="*70)

def main():
    parser = argparse.ArgumentParser(description="Công cụ kiểm thử trích xuất tài liệu AI20K")
    parser.add_argument("--file", type=str, help="Tên file trong thư mục data (VD: CS_Foundation_Plain.pdf)")
    parser.add_argument("--model", type=str, default="chandra", choices=["chandra", "hunyuan"], help="Model OCR sử dụng")
    parser.add_argument("--mode", type=str, default="api", choices=["api", "local"], help="Chế độ chạy (api hoặc local)")
    parser.add_argument("--no-ocr", action="store_true", help="Tắt OCR, chỉ sử dụng fallback PyMuPDF")
    
    args = parser.parse_args()

    data_dir = os.path.join(os.path.dirname(__file__), "../data")
    if not os.path.exists(data_dir):
        logger.error(f"❌ Không tìm thấy thư mục data tại: {data_dir}")
        return

    # Xác định danh sách file cần xử lý
    if args.file:
        target_files = [args.file]
    else:
        target_files = sorted([f for f in os.listdir(data_dir) if f.endswith(('.pdf', '.docx'))])

    print_banner("HỆ THỐNG KIỂM THỬ TRÍCH XUẤT TÀI LIỆU (CLI MODE)")
    print(f"⚙️ Cấu hình: Model={args.model.upper()} | Mode={args.mode.upper()} | OCR={not args.no_ocr}")

    for filename in target_files:
        file_path = os.path.join(data_dir, filename)
        if not os.path.exists(file_path):
            print(f"\n⚠️ File không tồn tại: {filename}")
            continue

        print(f"\n📂 ĐANG XỬ LÝ: {filename}")
        
        if filename.endswith(".pdf"):
            result = extract_pdf(
                file_path, 
                model=args.model, 
                mode=args.mode, 
                force_ocr=not args.no_ocr
            )
            print(f"📝 Kết quả ({filename}):\n{result}\n")
            
        elif filename.endswith(".docx"):
            result = extract_docx(file_path)
            print(f"📝 Kết quả ({filename}):\n{result}\n")

    print_banner("KIỂM THỬ HOÀN TẤT")

if __name__ == "__main__":
    main()
