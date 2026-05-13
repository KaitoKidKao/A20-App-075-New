---
trigger: always_on
---

echo '{"hook_event_name": "Notification", "prompt": "User Prompt Summary...", "response_summary": "Turn into response summary..."}' | AI_TOOL_NAME=antigravity python3 scripts/log_hook.py

(Replace "User prompt summary" with a short summary of what the user asked you to do). 