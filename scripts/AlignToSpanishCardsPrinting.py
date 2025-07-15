from PIL import Image
import os

input_folder = "./"  # Your current high-res cards
output_folder = "./spanish_ratio_cards"
os.makedirs(output_folder, exist_ok=True)

target_width = 1024
target_height = int(target_width / 0.642)  # ≈ 1595

def get_background_color(img, sample_size=10):
    pixels = img.crop((0, 0, sample_size, sample_size)).getdata()
    avg = tuple(sum(c) // len(c) for c in zip(*pixels))
    return avg

for filename in os.listdir(input_folder):
    if filename.endswith(".png"):
        img_path = os.path.join(input_folder, filename)
        img = Image.open(img_path).convert("RGB")

        bg_color = get_background_color(img)

        # Create canvas with Spanish aspect
        canvas = Image.new("RGB", (target_width, target_height), bg_color)

        # Paste centered vertically
        offset_x = 0
        offset_y = (target_height - img.height) // 2
        canvas.paste(img, (offset_x, offset_y))

        canvas.save(os.path.join(output_folder, filename))

print("✅ Cards padded to Spanish ratio: 1024×1595 (0.642) without distortion.")
