import os
from PIL import Image
import numpy as np

# === CONFIGURATION ===
reference_image = "4e.png"        # Reference image filename
image_folder = "."                # Folder with input .png files
output_folder = "./output_folder" # Output folder
threshold = 50                    # Pixel difference threshold

# === SETUP ===
os.makedirs(output_folder, exist_ok=True)
ref_img = Image.open(os.path.join(image_folder, reference_image)).convert("RGB")
ref_pixels = np.array(ref_img)

# Sample border pixels to get average background color
h, w, _ = ref_pixels.shape
edge_samples = np.concatenate([
    ref_pixels[0, :, :],
    ref_pixels[-1, :, :],
    ref_pixels[:, 0, :],
    ref_pixels[:, -1, :]
], axis=0)
ref_bg_color = edge_samples.mean(axis=0)

# === PROCESS IMAGES ===
for filename in os.listdir(image_folder):
    if filename.endswith(".png") and filename != reference_image:
        img_path = os.path.join(image_folder, filename)
        img = Image.open(img_path).convert("RGB")
        img_array = np.array(img)

        # Calculate mask for foreground
        diff = np.abs(img_array - ref_bg_color)
        mask = (diff > threshold).any(axis=2)

        # Create output image with uniform background
        new_img_array = np.tile(ref_bg_color, (h, w, 1)).astype(np.uint8)
        new_img_array[mask] = img_array[mask]

        # Save result
        out_img = Image.fromarray(new_img_array)
        out_img.save(os.path.join(output_folder, filename))

print("✅ All backgrounds adjusted and saved to", output_folder)
