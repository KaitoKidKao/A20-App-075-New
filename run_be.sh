#!/bin/bash

# Đảm bảo PYTHONPATH bao gồm thư mục gốc để có thể import từ src
export PYTHONPATH=$PYTHONPATH:$(pwd)

echo "🚀 Đang khởi chạy A20 Backend FastAPI..."
echo "📍 API sẽ chạy tại: http://localhost:8000"
echo "📚 Tài liệu Swagger: http://localhost:8000/docs"

# Chạy uvicorn với chế độ reload để tiện phát triển
uvicorn src.backend.main:app --host 0.0.0.0 --port 8000 --reload
