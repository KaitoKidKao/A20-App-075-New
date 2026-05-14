import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api/videos/0074af5c-cbd6-41a7-a56f-e3937f27c61f'
endpoints = ['timeline', 'highlights', 'questions', 'briefing', 'flashcards', 'viz-data']

# We need a token because these endpoints might require authentication
# But the user is logged in on the web.
# I'll check if they are public.
# In videos_router.py, they have current_user: User = Depends(get_current_user)

print(f"Checking endpoints for {BASE_URL}")
for e in endpoints:
    try:
        url = f"{BASE_URL}/{e}"
        # We don't have a token here, so it might return 401
        r = requests.get(url)
        print(f"{e}: {r.status_code}")
        if r.status_code != 200:
            print(f"  Error: {r.text}")
    except Exception as ex:
        print(f"{e}: FAILED - {ex}")
