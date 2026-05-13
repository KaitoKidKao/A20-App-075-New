import os

restoration_map = {
    "b?ng_điểm": "bảng_điểm",
    "??i_học": "đại_học",
    "lu?t": "luật",
    "b?ng": "bảng",
    "??i": "đại",
}

syn_path = r"c:\Users\ASUS\A20-App-075\data\VSL_HamNoSys\Synonyms.txt"
with open(syn_path, 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

fixed_lines = []
for line in lines:
    fixed_line = line
    for corrupted, correct in restoration_map.items():
        fixed_line = fixed_line.replace(corrupted, correct)
    fixed_lines.append(fixed_line)

with open(syn_path, 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print(f"Successfully fixed {len(lines)} lines in Synonyms.txt")
