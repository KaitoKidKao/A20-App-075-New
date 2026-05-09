from PIL import Image
import os

img_path = r"c:\Users\ASUS\A20-App-075\src\frontend\public\assets\avatar\hand_sprites.png"
if os.path.exists(img_path):
    with Image.open(img_path) as img:
        print(f"Dimensions: {img.width}x{img.height}")
else:
    print("File not found")
