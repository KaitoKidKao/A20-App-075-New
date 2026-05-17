import re

def natural_sort_key(title):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', title or '')]

titles = [
    "#2 Django tutorials ｜ Setup.mp4",
    "#3 Django tutorials ｜ First App in Django - part 1.mp4",
    "#4 Django tutorials ｜ First App Django - part 2.mp4",
    "#7 Django tutorials ｜ Addition of Two Numbers in Django.mp4",
    "#8 Django tutorials ｜ GET vs POST ｜ HTTP Methods.mp4",
    "#10 Django tutorials ｜ Static Files - 1.mp4",
    "#1 Django tutorials ｜ What is Django？ ｜ Python Web Framework.mp4",
    "#9 Django tutorials ｜ Model View Template in Django ｜ MVT.mp4",
    "#5 Django tutorials ｜ Django Template Language ｜ DTL.mp4",
    "#6 Django tutorials ｜ Django Template Language - part 2.mp4"
]

sorted_titles = sorted(titles, key=natural_sort_key)
with open("scratch/sorted_titles.txt", "w", encoding="utf-8") as f:
    f.write("Sorted Titles:\n")
    for idx, title in enumerate(sorted_titles, 1):
        f.write(f"{idx}. {title}\n")
print("Done")
