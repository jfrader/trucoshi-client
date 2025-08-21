import os
from PIL import Image, ImageDraw

def crop_and_add_transparent_corners(image_path, target_size, radius, output_folder):
    """
    Crops the image to the target size (centered), applies a rounded rectangle mask
    to make corners transparent, and saves to the output subfolder with the same filename.
    """
    # Open the image and convert to RGBA
    img = Image.open(image_path).convert("RGBA")
    
    # Calculate crop box to center the target size
    target_width, target_height = target_size
    left = (img.width - target_width) // 2
    top = (img.height - target_height) // 2
    right = left + target_width
    bottom = top + target_height
    crop_box = (left, top, right, bottom)
    
    # Crop the image
    img_cropped = img.crop(crop_box)
    
    # Create a mask for the cropped image
    mask = Image.new("L", img_cropped.size, 0)
    draw = ImageDraw.Draw(mask)

    # Draw a rounded rectangle on the mask
    draw.rounded_rectangle((0, 0, img_cropped.width, img_cropped.height), radius=radius, fill=255)

    # Apply the mask to the alpha channel
    img_cropped.putalpha(mask)

    # Use the original filename for the output
    new_path = os.path.join(output_folder, os.path.basename(image_path))
    
    # Save the image to the new path
    img_cropped.save(new_path)
    return new_path

# Set the radius for rounded corners
RADIUS = 54  # Adjust if needed

# Set the target size
TARGET_SIZE = (1025, 1537)

# Define input and output folders
INPUT_FOLDER = "./"
OUTPUT_FOLDER = "./rounded_corners"

# Create the output subfolder if it doesn't exist
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

# Process all PNG files in the input folder
for filename in os.listdir(INPUT_FOLDER):
    if filename.lower().endswith('.png'):
        print(f"Processing {filename}...")
        image_path = os.path.join(INPUT_FOLDER, filename)
        new_file = crop_and_add_transparent_corners(image_path, TARGET_SIZE, RADIUS, OUTPUT_FOLDER)
        print(f"Saved as {new_file}")

print("All PNG files processed: cropped to 1025×1537 and transparent corners added.")
