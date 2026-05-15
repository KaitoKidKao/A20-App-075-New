import os

new_syns = [
    ('công_nghệ_thông_tin', 'máy_vitinh'),
    ('it', 'máy_vitinh'),
    ('khoa_học_máy_tính', 'máy_vitinh'),
    ('quản_trị_kinh_doanh', 'kinh'),
    ('marketing', 'kinh'),
    ('marketing', 'giới_thiệu'),
    ('tài_chính', 'kinh'),
    ('ngân_hàng', 'tiền'),
    ('ngân_hàng', 'kinh'),
    ('kinh_tế', 'kinh')
]

syn_path = r"c:\Users\ASUS\A20-App-075\data\VSL_HamNoSys\Synonyms.txt"
with open(syn_path, 'a', encoding='utf-8') as f:
    for w, s in new_syns:
        f.write(f"{w}\t{s}\n")

print(f"Added {len(new_syns)} new synonyms to Synonyms.txt")
