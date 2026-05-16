import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from src.backend.services.ai_service import AIService
from src.backend import config

@pytest.mark.asyncio
@patch("src.backend.services.ai_service.AsyncOpenAI")
async def test_summarize_success(mock_openai_class):
    mock_client = mock_openai_class.return_value
    mock_client.chat.completions.create = AsyncMock(return_value=MagicMock(
        choices=[MagicMock(message=MagicMock(content="- Trí tuệ nhân tạo (AI) và khái niệm Machine Learning.\n- Ba loại học máy chính: học có giám sát, không giám sát và tăng cường.\n- Tầm quan trọng của dữ liệu trong huấn luyện mô hình."))]
    ))
    
    # Nội dung bài giảng thực tế về Machine Learning
    lecture_content = (
        "Chào các bạn, hôm nay chúng ta sẽ thảo luận về sự phát triển của trí tuệ nhân tạo. "
        "AI không chỉ là một thuật ngữ đơn thuần mà nó bao gồm nhiều lĩnh vực con, nổi bật nhất là Machine Learning. "
        "Học máy cho phép máy tính tự học hỏi từ các tập dữ liệu lớn mà không cần lập trình cụ thể từng bước. "
        "Có ba phương pháp huấn luyện chính mà chúng ta cần ghi nhớ: học có giám sát sử dụng dữ liệu gán nhãn, "
        "học không giám sát để tìm ra các cấu trúc ẩn trong dữ liệu, và học tăng cường dựa trên cơ chế thưởng phạt."
    )
    
    transcript = {"segments": [{"text": lecture_content}]}
    result = await AIService.summarize(transcript)
    
    assert len(result) == 3
    assert "Trí tuệ nhân tạo" in result[0]
    assert "Ba loại học máy" in result[1]
    mock_client.chat.completions.create.assert_called_once()

@pytest.mark.asyncio
@patch("src.backend.services.ai_service.AsyncOpenAI")
async def test_process_all_lecture_metadata_realistic(mock_openai_class):
    mock_client = mock_openai_class.return_value
    # Giả lập phản hồi JSON thực tế từ AI
    realistic_json = {
        "timeline": [
            {"time": "00:00", "title": "Giới thiệu về AI"},
            {"time": "05:15", "title": "Khái niệm Machine Learning"},
            {"time": "12:30", "title": "Các phương pháp huấn luyện"}
        ],
        "highlights": [
            {"time": "08:45", "reason": "Định nghĩa cốt lõi", "context": "Học máy là khả năng tự học từ dữ liệu."},
            {"time": "15:20", "reason": "Kiến thức thi cử", "context": "Phân biệt học có giám sát và không giám sát."}
        ],
        "questions": [
            {"time": "10:00", "original": "Thế nào là data gán nhãn?", "rephrased": "Giải thích khái niệm dữ liệu được gán nhãn (labeled data) trong học máy."}
        ]
    }
    
    import json
    mock_client.chat.completions.create = AsyncMock(return_value=MagicMock(
        choices=[MagicMock(message=MagicMock(content=json.dumps(realistic_json)))]
    ))
    
    transcript = {
        "video_id": "lecture-ai-001",
        "segments": [
            {"start": 0.0, "text": "Chào mừng các bạn đến với khóa học AI."},
            {"start": 315.0, "text": "Bây giờ chúng ta sẽ đi sâu vào Machine Learning."}
        ]
    }
    
    result = await AIService.process_all_lecture_metadata(transcript)
    
    assert len(result["timeline"]) == 3
    assert result["timeline"][1]["title"] == "Khái niệm Machine Learning"
    assert len(result["highlights"]) == 2
    assert "labeled data" in result["questions"][0]["rephrased"]

@pytest.mark.asyncio
@patch("src.backend.services.ai_service.AsyncOpenAI")
async def test_generate_pre_lecture_briefing_realistic(mock_openai_class):
    mock_client = mock_openai_class.return_value
    realistic_briefing = {
        "objective": "Hiểu được các khái niệm cơ bản về AI và Machine Learning.",
        "key_terms": ["Machine Learning", "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"],
        "summary": "Bài giảng cung cấp cái nhìn tổng quan về cách máy tính học từ dữ liệu và các phương pháp huấn luyện phổ biến hiện nay."
    }
    
    import json
    mock_client.chat.completions.create = AsyncMock(return_value=MagicMock(
        choices=[MagicMock(message=MagicMock(content=json.dumps(realistic_briefing)))]
    ))
    
    transcript = {"video_id": "briefing-test", "segments": [{"text": "Nội dung bài giảng về AI..."}]}
    result = await AIService.generate_pre_lecture_briefing(transcript)
    
    assert "Supervised Learning" in result["key_terms"]
    assert result["objective"].startswith("Hiểu được")
