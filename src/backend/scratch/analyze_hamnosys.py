import json
from collections import Counter

with open(r'c:\Users\ASUS\A20-App-075\src\backend\data\vsl_processed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

hand_tokens = []
for word, info in data['dictionary'].items():
    if 'hand' in info:
        tokens = info['hand'].split(',')
        hand_tokens.extend(tokens)

counts = Counter(hand_tokens)

print("Top 50 Hand Tokens:")
for token, count in counts.most_common(50):
    print(f"{token}: {count}")
