from PIL import Image
from collections import Counter
import sys

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

def get_dominant_colors(image_path, num_colors=15):
    img = Image.open(image_path)
    img = img.convert('RGB')
    
    # Crop to the bottom part where the pills are
    width, height = img.size
    img = img.crop((0, int(height * 0.8), width, height))
    
    pixels = list(img.getdata())
    
    # No quantization
    counts = Counter(pixels)
    
    most_common = counts.most_common(num_colors)
    print("Most common exact colors at the bottom:")
    for rgb, count in most_common:
        print(f"Hex: {rgb_to_hex(rgb)}, RGB: {rgb}, Count: {count}")

get_dominant_colors('new color.JPG', 30)
