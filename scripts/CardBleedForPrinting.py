from PIL import Image
import os

input_folder = "./spanish_ratio_cards"
output_folder = "./with_bleed"
os.makedirs(output_folder, exist_ok=True)

# Add 59 px (5 mm at 300 DPI) to each side
bleed_px = 59

for filename in os.listdir(input_folder):
    if filename.endswith(".png"):
        img_path = os.path.join(input_folder, filename)
        img = Image.open(img_path)  # Keep original mode
        
        # Convert to RGBA to access alpha channel
        img = img.convert('RGBA')
        
        # Get background color from pixel (40, 40), with fallback
        pixel_40_40 = img.getpixel((40, 40))
        bg_color = pixel_40_40[:3] if pixel_40_40[3] != 0 else (255, 255, 255)  # Use (40, 40) if not transparent, else default to white

        # Create a new image with the same size, filling transparent areas
        filled_img = Image.new("RGBA", img.size, (*bg_color, 255))  # Fully opaque background
        pixels = img.load()
        
        # Copy non-transparent pixels, fill transparent with bg_color
        for x in range(img.width):
            for y in range(img.height):
                if pixels[x, y][3] != 0:  # If pixel is not transparent
                    filled_img.putpixel((x, y), pixels[x, y])
                else:
                    filled_img.putpixel((x, y), (*bg_color, 255))  # Fill transparent with bg_color

        # Convert to RGB for final output
        filled_img = filled_img.convert('RGB')

        # Create new image with bleed
        new_width = img.width + 2 * bleed_px
        new_height = img.height + 2 * bleed_px
        canvas = Image.new("RGB", (new_width, new_height), bg_color)

        # Paste centered
        canvas.paste(filled_img, (bleed_px, bleed_px))

        # Save
        canvas.save(os.path.join(output_folder, filename))

print("✅ Transparency filled and bleed added to all cards: +5mm on each side (≈59 px at 300 DPI).")