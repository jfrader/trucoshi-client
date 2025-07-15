#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Installing it now..."
    sudo pacman -S imagemagick
fi

# Get the current directory name
parent_dir=$(basename "$(pwd)")

# Create new folder inside current directory
new_folder="${parent_dir}_resized"
mkdir -p "$new_folder"

# Loop through all PNG files in current directory
for file in *.png; do
    # Check if there are any PNG files
    if [ ! -e "$file" ]; then
        echo "No PNG files found in current directory"
        exit 1
    fi
    
    # Get the filename without path
    filename=$(basename "$file")
    
    # Get original dimensions
    dimensions=$(identify -format "%w %h" "$file")
    read orig_width orig_height <<< "$dimensions"
    
    # Calculate new dimensions (25% of original)
    new_width=$((orig_width / 4))
    new_height=$((orig_height / 4))
    
    # Calculate corner radius (using 10% of smaller dimension)
    radius=$(( (new_width < new_height ? new_width : new_height) / 20 ))
    
    # Process the image:
    # 1. Resize to 25%
    # 2. Create rounded corners with transparent background
    convert "$file" \
        -resize 25% \
        \( +clone -alpha extract \
        -draw "fill black polygon 0,0 0,$radius $radius,0 fill white circle $radius,$radius $radius,0" \
        \( +clone -flip \) -compose Multiply -composite \
        \( +clone -flop \) -compose Multiply -composite \
        \) -alpha off -compose CopyOpacity -composite \
        "$new_folder/$filename"
    
    echo "Processed: $filename"
done

echo "All PNG files have been resized with rounded corners and saved to $new_folder/"
