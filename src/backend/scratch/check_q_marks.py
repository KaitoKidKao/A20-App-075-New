import json

json_path = r"c:\Users\ASUS\A20-App-075\src\backend\data\vsl_processed.json"
with open(json_path, 'r', encoding='utf-8') as f:
    content = f.read()

q_count = content.count('?')
print(f"Literal '?' count: {q_count}")

# Check for specific words the user mentioned
words = ["c?ng_ngh?_th?ng_tin", "m?y_vitinh", "qu?n_tr?_kinh_doanh"]
for w in words:
    if w in content:
        print(f"FOUND literal corrupted word: {w}")
    else:
        print(f"Not found literal corrupted word: {w}")
