import os

syn_path = r"c:\Users\ASUS\A20-App-075\data\VSL_HamNoSys\Synonyms.txt"
with open(syn_path, 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

corrupted = [l.strip() for l in lines if '?' in l]
for l in corrupted[:100]:
    print(l)
