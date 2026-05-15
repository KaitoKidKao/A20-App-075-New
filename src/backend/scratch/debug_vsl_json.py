import json
import os

json_path = r"c:\Users\ASUS\A20-App-075\src\backend\data\vsl_processed.json"
with open(json_path, 'r', encoding='utf-8', errors='replace') as f:
    data = json.load(f)

synonyms = data.get("synonyms", {})
print(f"Total synonyms: {len(synonyms)}")

keys_to_check = [
    "công_nghệ_thông_tin", "it", "khoa_học_máy_tính", 
    "quản_trị_kinh_doanh", "marketing", "tài_chính", "ngân_hàng"
]

for key in keys_to_check:
    if key in synonyms:
        print(f"Found {key}: {synonyms[key]}")
    else:
        # Check for garbled versions
        print(f"NOT FOUND: {key}")

# Print last 5 synonyms to see the format
last_keys = list(synonyms.keys())[-10:]
for k in last_keys:
    print(f"Last key: {k} -> {synonyms[k]}")
