from src.backend.services.artifact_service import build_ai_analysis


def test_build_ai_analysis_normalizes_artifacts_and_marks_ready():
    result = build_ai_analysis(
        transcript={"segments_by_language": {"vi": []}},
        summary=["  Y chinh 1  ", ""],
        metadata={
            "timeline": [{"time": "00:10", "title": "Mo dau"}],
            "highlights": [{"time": "00:20", "reason": "Quan trong", "context": "Noi dung"}],
            "questions": [{"time": "00:30", "original": "Q?", "rephrased": "Q ro hon?"}],
        },
        briefing={"objective": "Hoc AI", "summary": "Tong quan", "key_terms": ["AI", ""]},
        notebook_data={
            "flashcards": [{"front": "AI la gi?", "back": "Tri tue nhan tao"}],
            "visual_data": {"infographic": {"title": "AI"}},
            "cover_image_url": "https://example.com/cover.png",
        },
        handsign_data=[{"time": 0, "word": "ai"}],
        quizzes=[
            {
                "question_text": "AI la gi?",
                "options": {"A": "Dung", "B": "Sai"},
                "correct_answer": "A",
                "explanation": "Giai thich",
                "difficulty": "De",
            }
        ],
    )

    assert result["summary"] == ["Y chinh 1"]
    assert result["timeline"] == [{"time": "00:10", "title": "Mo dau"}]
    assert result["flashcards"][0]["front"] == "AI la gi?"
    assert result["quizzes"][0]["correct_answer"] == "A"
    assert result["artifact_status"]["summary"]["status"] == "ready"
    assert result["artifact_status"]["visual_data"]["status"] == "ready"
    assert result["artifact_status"]["quizzes"]["status"] == "ready"


def test_build_ai_analysis_marks_failed_artifact_without_breaking_others():
    result = build_ai_analysis(
        transcript={"segments_by_language": {"en": []}},
        summary=["Ready"],
        metadata=None,
        briefing={},
        notebook_data={},
        handsign_data=[],
        quizzes=[],
        errors={"metadata": "metadata timeout"},
    )

    assert result["summary"] == ["Ready"]
    assert result["artifact_status"]["summary"]["status"] == "ready"
    assert result["artifact_status"]["timeline"]["status"] == "failed"
    assert result["artifact_status"]["timeline"]["error"] == "metadata timeout"
    assert result["artifact_status"]["flashcards"]["status"] == "empty"
