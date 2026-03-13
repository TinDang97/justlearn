# Lesson 7: Pillow: Image Processing

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Open, display, and save images with Pillow
- Resize, crop, and rotate images
- Apply filters and effects
- Process multiple images in batch

---

## Lesson Outline

### Part 1: Image Basics (30 minutes)

#### Explanation

```python
from PIL import Image

# Open image:
img = Image.open("photo.jpg")
print(img.size)      # (1920, 1080) - width, height in pixels
print(img.mode)      # "RGB", "RGBA", "L" (grayscale), etc.
print(img.format)    # "JPEG", "PNG", etc.

# Save in different format:
img.save("output.png")     # Convert JPEG to PNG
img.save("thumb.jpg", quality=85)  # JPEG with quality

# Show image (opens in default viewer):
img.show()

# Create new image:
new_img = Image.new("RGB", (800, 600), color=(255, 0, 0))  # Red image
new_img.save("red.png")

# Pixel access:
r, g, b = img.getpixel((100, 100))   # Get pixel at x=100, y=100
img.putpixel((100, 100), (255, 0, 0))  # Set pixel to red
```

#### Practice

Open an image, print its properties, save a copy in PNG format with width/height swapped.

---

### Part 2: Transformations (30 minutes)

#### Explanation

```python
from PIL import Image, ImageOps, ImageFilter

img = Image.open("photo.jpg")

# Resize:
resized = img.resize((800, 600))       # Exact size (may distort)
thumbnail = img.copy()
thumbnail.thumbnail((400, 400))         # Fit within bounds, keeps ratio

# Crop (left, upper, right, lower):
cropped = img.crop((100, 100, 500, 400))

# Rotate:
rotated = img.rotate(45, expand=True)   # expand=True grows canvas

# Flip:
flipped_h = img.transpose(Image.FLIP_LEFT_RIGHT)
flipped_v = img.transpose(Image.FLIP_TOP_BOTTOM)

# Grayscale:
gray = img.convert("L")

# Filters:
from PIL import ImageFilter
blurred = img.filter(ImageFilter.BLUR)
sharpened = img.filter(ImageFilter.SHARPEN)
edges = img.filter(ImageFilter.FIND_EDGES)

# Adjust brightness, contrast:
from PIL import ImageEnhance
enhancer = ImageEnhance.Brightness(img)
brighter = enhancer.enhance(1.5)   # 1.0 = original, >1 = brighter

enhancer = ImageEnhance.Contrast(img)
more_contrast = enhancer.enhance(2.0)
```

#### Practice

Create a function `make_thumbnail(input_path, output_path, size=(256, 256))` that resizes any image proportionally.

---

### Part 3: Text and Drawing (30 minutes)

#### Explanation

```python
from PIL import Image, ImageDraw, ImageFont

# Create image with drawing:
img = Image.new("RGB", (800, 400), "white")
draw = ImageDraw.Draw(img)

# Draw shapes:
draw.rectangle([(50, 50), (350, 250)], outline="blue", width=3)
draw.ellipse([(400, 50), (750, 250)], fill="red", outline="darkred")
draw.line([(0, 0), (800, 400)], fill="gray", width=2)

# Draw text:
try:
    font = ImageFont.truetype("arial.ttf", 36)   # Custom font
except IOError:
    font = ImageFont.load_default()              # Fallback

draw.text((100, 300), "Hello, Pillow!", fill="black", font=font)

img.save("drawn.png")


# Batch processing - add watermark to all images:
from pathlib import Path

def add_watermark(image_path: Path, output_dir: Path, text: str):
    img = Image.open(image_path).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Draw semi-transparent text:
    draw.text((10, 10), text, fill=(255, 255, 255, 128))

    watermarked = Image.alpha_composite(img, overlay)
    output_path = output_dir / image_path.name
    watermarked.convert("RGB").save(output_path)
```

#### Practice

Build a function `create_contact_card(name, title, photo_path)` that generates a business card image.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Image Processor

Build an `ImageProcessor` class:
- `resize_all(directory, width, height)` — batch resize
- `convert_all(directory, format)` — batch format conversion
- `create_contact_sheet(images, cols)` — grid of thumbnails
- `add_border(img, size, color)` — add colored border

#### Exercise 2: Photo Gallery Generator

Given a directory of photos:
1. Create thumbnails (200x200) for all images
2. Generate an HTML file that displays them in a grid
3. Save original → `originals/`, thumbnails → `thumbs/`
4. Report: count, total file size, average dimensions

---

## Key Takeaways

- `Image.open()` loads; `img.save()` saves (format from extension)
- `img.resize()` exact size; `img.thumbnail()` proportional fit
- `Image.convert("L")` → grayscale; `convert("RGBA")` → with alpha
- `ImageDraw` for shapes and text; `ImageFilter` for blur/sharpen
- `ImageEnhance` for brightness, contrast, color, sharpness

---

[← Previous](./lesson-06-regular-expressions.md) | [Back to Course](./README.md) | [Next →](./lesson-08-argparse-cli-tools.md)
