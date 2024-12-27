from flask import Flask, request, jsonify, send_file
from PIL import Image, ImageOps, ImageEnhance, ImageDraw, ImageFilter, ImageFont
import io
import os
import numpy as np
import random

app = Flask(__name__)

############################
# 1. Film Grain
############################
def add_film_grain(image, intensity=50, offset=25):
    """
    Adds film-like grain by injecting random noise.
    :param image: PIL Image
    :param intensity: Max noise value (0-255). Higher => more grain
    :param offset: Offset to shift the noise distribution
    :return: PIL Image with film grain
    """
    np_img = np.array(image.convert('RGB'), dtype=np.int16)
    noise = np.random.randint(0, intensity, (np_img.shape[0], np_img.shape[1], 1), dtype='int16')
    noise = np.repeat(noise, 3, axis=2)  # replicate into R/G/B
    np_img = np_img + noise - offset
    np_img = np.clip(np_img, 0, 255).astype('uint8')
    return Image.fromarray(np_img)

############################
# 2. Light Leaks
############################
def add_light_leaks(image, leak_count=5, alpha=0.25):
    """
    Adds random elliptical color overlays ("light leaks").
    :param image: PIL Image
    :param leak_count: How many leaks
    :param alpha: Blend factor
    :return: PIL Image
    """
    overlay = Image.new('RGB', image.size, (0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    width, height = image.size
    
    possible_colors = [
        (255, 200, 100),
        (255, 150, 50),
        (255, 50, 50),
        (255, 220, 180),
        (255, 100, 200),
    ]
    
    for _ in range(leak_count):
        x = random.randint(0, width)
        y = random.randint(0, height)
        radius = random.randint(50, 200)
        color = random.choice(possible_colors)
        draw.ellipse(
            [(x - radius, y - radius), (x + radius, y + radius)],
            fill=color
        )
        
    return Image.blend(image, overlay, alpha=alpha)

############################
# 3. Vignette
############################
def apply_vignette(image, radius_factor=1.6, strength=0.7):
    """
    Darken edges to create a vignette.
    :param image: PIL Image
    :param radius_factor: Determines ellipse size
    :param strength: How strong (dark) the vignette is
    :return: PIL Image
    """
    width, height = image.size
    vignette_mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(vignette_mask)
    
    max_radius = int(min(width, height) // radius_factor)
    
    draw.ellipse(
        [(width//2 - max_radius, height//2 - max_radius),
         (width//2 + max_radius, height//2 + max_radius)],
        fill=255
    )
    
    # Blur for smooth edges
    vignette_mask = vignette_mask.filter(ImageFilter.GaussianBlur(radius=width // 4))
    
    # Invert and scale by strength
    inverted_mask = ImageOps.invert(vignette_mask)
    final_mask = inverted_mask.point(lambda x: x * strength)
    
    black_bg = Image.new('RGB', (width, height), (0, 0, 0))
    return Image.composite(black_bg, image, final_mask).convert('RGB')

############################
# 4. Sepia
############################
def apply_sepia(img):
    """
    Applies a sepia effect.
    :param img: PIL Image
    :return: PIL Image
    """
    sepia_filter = ImageEnhance.Color(img)
    img = sepia_filter.enhance(0.7)  # lower saturation first
    
    np_img = np.array(img)
    sepia_overlay = np.dot(
        np_img[..., :3],
        [[0.272, 0.534, 0.131],
         [0.349, 0.686, 0.168],
         [0.393, 0.769, 0.189]]
    )
    sepia_overlay = np.clip(sepia_overlay, 0, 255).astype('uint8')
    return Image.fromarray(sepia_overlay)

############################
# 5. Cross Processing
############################
def apply_cross_processing(img):
    """
    Mimic cross-processing effect via color shifts.
    :param img: PIL Image
    :return: PIL Image
    """
    np_img = np.array(img.convert('RGB'), dtype=np.float32)
    np_img /= 255.0
    
    # Tweak channels for a "cross-processed" look
    np_img[..., 1] = np.power(np_img[..., 1], 0.9)   # green
    np_img[..., 0] = np.clip(np_img[..., 0] * 1.1, 0, 1)  # red
    np_img[..., 2] = np.power(np_img[..., 2], 0.8)   # blue
    
    np_img = np.clip(np_img * 255, 0, 255).astype('uint8')
    return Image.fromarray(np_img)

############################
# 6. Lomo Effect
############################
def apply_lomo(image):
    """
    Lomo-style effect: high contrast, saturated colors, heavy vignette.
    :param image: PIL Image
    :return: PIL Image
    """
    # Boost saturation
    enhancer = ImageEnhance.Color(image)
    lomo_img = enhancer.enhance(1.1)
    
    # Slight contrast bump
    enhancer = ImageEnhance.Contrast(lomo_img)
    lomo_img = enhancer.enhance(1.05)
    
    # Subtle color shift (cheap lens effect)
    np_img = np.array(lomo_img.convert('RGB'), dtype=np.float32)
    np_img[..., 1] = np.clip(np_img[..., 1] * 1.05, 0, 255)  # extra green
    lomo_img = Image.fromarray(np_img.astype('uint8'))
    
    # Heavy vignette
    lomo_img = apply_vignette(lomo_img, radius_factor=1.3, strength=1.0)
    return lomo_img

############################
# 7. Chromatic Aberration
############################
def add_chromatic_aberration(img, shift=5):
    """
    Slightly misalign color channels.
    :param img: PIL Image
    :param shift: Pixel shift for R/B
    :return: PIL Image
    """
    r, g, b = img.convert('RGB').split()
    r = r.transform(r.size, Image.AFFINE, (1, 0, -shift, 0, 1, 0))
    b = b.transform(b.size, Image.AFFINE, (1, 0, shift, 0, 1, 0))
    return Image.merge("RGB", (r, g, b))

############################
# 8. Halation (Bloom / Glow)
############################
def add_halation(img, blur_radius=15, intensity=0.4):
    """
    Adds a soft glow around bright areas.
    :param img: PIL Image
    :param blur_radius: How big the glow is
    :param intensity: Blend strength
    :return: PIL Image
    """
    base = img.convert("RGB")
    gray = base.convert("L")
    bright_mask = gray.point(lambda p: 255 if p > 180 else 0, mode='1')
    bright_mask_img = bright_mask.convert("RGB")
    glow = bright_mask_img.filter(ImageFilter.GaussianBlur(blur_radius))
    return Image.blend(base, glow, intensity)

############################
# 9. Dust & Scratches Overlay
############################
def add_dust_and_scratches(img, dust_image_path="dust_texture.png", alpha=0.3):
    """
    Overlays a dust/scratches texture.
    :param img: PIL Image
    :param dust_image_path: Path to dust texture
    :param alpha: Blend factor
    :return: PIL Image
    """
    base = img.convert("RGBA")
    dust = Image.open(dust_image_path).convert("RGBA")
    dust = dust.resize(img.size)
    dust.putalpha(int(alpha * 255))
    return Image.alpha_composite(base, dust).convert("RGB")

############################
# 10. Date/Time Stamp
############################
def add_date_stamp_bottom_right(img, text=None, padding=50, font_size=52, color=(255,222,33)):
    """
    Adds a date/time stamp to the bottom-right corner with a bigger font.
    """
    if text is None:
        from datetime import datetime
        text = datetime.now().strftime('%Y-%m-%d %H:%M')
    
    draw = ImageDraw.Draw(img)
    
    # Specify a known valid TTF with a large font size
    try:
        font = ImageFont.truetype("/Users/princekumar/Documents/digitalCameraApp/flask-server/font.ttf", font_size)
    except OSError:
        print("TTF not found, using default font. Text may be small.")
        font = ImageFont.load_default()
    
    # In modern Pillow versions, use textbbox or font.getsize:
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    img_width, img_height = img.size
    x = img_width - text_width - padding
    y = img_height - text_height - padding
    
    draw.text((x, y), text, fill=color, font=font)
    return img

############################
# 11. Polaroid / Instant Camera Frame
############################
def add_polaroid_frame(img, frame_width=50, bottom_extra=30, background_color=(255, 255, 255)):
    """
    Adds a Polaroid-style frame: thicker at the bottom.
    :param img: PIL Image
    :param frame_width: Border thickness for sides/top
    :param bottom_extra: Extra thickness at bottom
    :param background_color: Frame color (white)
    :return: PIL Image
    """
    width, height = img.size
    new_width = width + frame_width * 2
    new_height = height + frame_width + bottom_extra
    frame = Image.new('RGB', (new_width, new_height), background_color)
    frame.paste(img, (frame_width, frame_width))
    return frame

############################
# 12. Glitch / VHS Overlay
############################
def add_vhs_glitch(img, line_height=2, glitch_strength=10, alpha=0.3):
    """
    Adds horizontal glitch lines for a VHS look.
    :param img: PIL Image
    :param line_height: Height of glitch lines
    :param glitch_strength: Horizontal shift
    :param alpha: Blend factor
    :return: PIL Image
    """
    base = img.convert("RGBA")
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    width, height = base.size
    
    for y in range(0, height, line_height * 2):
        shift = random.randint(-glitch_strength, glitch_strength)
        draw.rectangle(
            [(0 + shift, y), (width + shift, y + line_height)],
            fill=(255, 0, 0, 80)
        )

    # Composite the overlay
    glitched = Image.alpha_composite(base, overlay).convert("RGB")
    # Subtly fade everything using point
    return glitched.point(lambda px: px * alpha + (1 - alpha) * px)

############################
# 13. Lens Flare
############################
def add_lens_flare(img, flare_center=None, radius=80, color=(255, 255, 200), intensity=0.4):
    """
    Adds a lens flare circle.
    :param img: PIL Image
    :param flare_center: (x, y) if None, random
    :param radius: Radius of flare
    :param color: Flare color
    :param intensity: Blend factor
    :return: PIL Image
    """
    width, height = img.size
    if flare_center is None:
        flare_center = (random.randint(0, width), random.randint(0, height))
    
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse(
        [(flare_center[0] - radius, flare_center[1] - radius),
         (flare_center[0] + radius, flare_center[1] + radius)],
        fill=color + (180,)
    )
    return Image.blend(img.convert('RGBA'), overlay, intensity).convert('RGB')

############################
# 14. Tilt-Shift / Depth of Field
############################
def apply_tilt_shift(image, blur_strength=15, focus_center=None, focus_height=100):
    """
    Simulates tilt-shift by blurring top/bottom, leaving a central band in focus.
    :param image: PIL Image
    :param blur_strength: GaussianBlur radius
    :param focus_center: Vertical center of focus band
    :param focus_height: Height of the band in focus
    :return: PIL Image
    """
    width, height = image.size
    if focus_center is None:
        focus_center = height // 2
    
    blurred = image.filter(ImageFilter.GaussianBlur(blur_strength))
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    top_focus = focus_center - focus_height // 2
    bottom_focus = focus_center + focus_height // 2
    draw.rectangle([(0, top_focus), (width, bottom_focus)], fill=255)
    
    # Feather edges
    mask = mask.filter(ImageFilter.GaussianBlur(blur_strength // 2))
    
    return Image.composite(image, blurred, mask)

def add_green_tint(image, factor=1.05):
    """
    Adds a mild green tint by scaling the green channel.
    
    :param image: PIL Image
    :param factor: How much to multiply the green channel (1.0 = no change)
    :return: PIL Image with a greenish tint
    """
    # Convert to RGB just in case (and to avoid issues with RGBA or L modes)
    np_img = np.array(image.convert('RGB'), dtype=np.float32)
    
    # Multiply the green channel by 'factor'
    # e.g. factor=1.05 => 5% more green
    np_img[..., 1] = np.clip(np_img[..., 1] * factor, 0, 255)
    
    # Convert back to uint8 and then back to PIL Image
    np_img = np_img.astype('uint8')
    return Image.fromarray(np_img)

############################
# 15. Posterize (Example of Cross Hatch / Sketch / Posterize)
############################
def apply_posterize(image, bits=3):
    """
    Posterize the image to reduce color levels.
    :param image: PIL Image
    :param bits: Number of bits (1-8). Lower => fewer colors.
    :return: PIL Image
    """
    return ImageOps.posterize(image, bits)

def apply_filter(img, filter_type):
    try:
        # Apply the chosen filter
        if filter_type == "digicam":

            img = add_date_stamp_bottom_right(
            img,
            padding=100,        # Increase padding if you want more spacing from edges
            font_size=122,
            color=(255,222,33)
            )

            img = add_green_tint(img, 1.023)

            brightness_enhancer = ImageEnhance.Brightness(img)
            img = brightness_enhancer.enhance(1.2)  # 1.2 => 20% brighter

            color_enhancer = ImageEnhance.Color(img)
            img = color_enhancer.enhance(1.95)  # 1.3 => 30% more saturation

            contrast_enhancer = ImageEnhance.Contrast(img)
            img = contrast_enhancer.enhance(1.15)  # 1.2 => subtle pop in contrast


            # 2) Mild film grain
            img = add_film_grain(img, intensity=45, offset=20)
            # Explanation:
            #  - "intensity=20" means noise up to 20
            #  - "offset=10" shifts the brightness less drastically

            # 3) Subtle vignette
            img = apply_vignette(img, radius_factor=1.7, strength=0.3)
            # Explanation:
            #  - "radius_factor=1.8" => fairly large vignette ellipse
            #  - "strength=0.3" => corners only a little darker

            # 4) Optional: gentle halation (glow on highlights)
            img = add_halation(img, blur_radius=5, intensity=0.1)
            # Explanation:
            #  - Smaller blur_radius=10 => less “spread” of bloom
            #  - intensity=0.2 => only a mild glow

            # 5) Optional: mild light leaks
            # Keep alpha small so it doesn't overwhelm the image
            img = add_light_leaks(img, leak_count=2, alpha=0.05)

            # 6) If you want a slight warm color shift
            # (You could skip this if your image is already warm)
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.05)  # a slight push over normal
        elif filter_type == "sepia":
            img = apply_sepia(img)
        elif filter_type == "invert":
            img = ImageOps.invert(img)
        elif filter_type == "brightness":
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(1.5)
        elif filter_type == "contrast":
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(2.0)
        elif filter_type == "saturate":
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(2.0)
        else:
            raise ValueError("Unsupported filter type.")
        return img
    except Exception as e:
        raise e

@app.route('/apply-filter', methods=['POST'])
def upload_and_filter():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file found in the request'}), 400
    if 'filter' not in request.form:
        return jsonify({'error': 'No filter specified in the request'}), 400

    file = request.files['image']
    filter_type = request.form['filter']
    try:
        # Always reload the original image for each request
        img = ImageOps.exif_transpose(Image.open(file.stream))

        # Apply the selected filter
        filtered_img = apply_filter(img, filter_type)

        # Save the processed image to a BytesIO object
        img_io = io.BytesIO()
        original_format = filtered_img.format or "JPEG"
        filtered_img.save(img_io, format=original_format)
        img_io.seek(0)

        # Return the processed image
        return send_file(img_io, mimetype=f'image/{original_format.lower()}')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
