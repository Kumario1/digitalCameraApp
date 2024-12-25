from flask import Flask, request, jsonify, send_file
from PIL import Image, ImageOps, ImageEnhance
import io
import os

app = Flask(__name__)

def apply_filter(img, filter_type):
    try:
        # Apply the chosen filter
        if filter_type == "grayscale":
            img = ImageOps.grayscale(img)
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
    

def apply_sepia(img):
    """Apply a sepia filter to an image."""
    sepia_img = ImageOps.colorize(ImageOps.grayscale(img), "#704214", "#C0A080")
    return sepia_img

@app.route('/apply-filter', methods=['POST'])
def upload_and_filter():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file found in the request'}), 400
    if 'filter' not in request.form:
        return jsonify({'error': 'No filter specified in the request'}), 400

    file = request.files['image']
    filter_type = request.form['filter']

    # Open the image
    img = Image.open(file.stream)

    # Apply the filter
    if filter_type == "grayscale":
        img = ImageOps.grayscale(img)
    elif filter_type == "sepia":
        img = ImageOps.colorize(ImageOps.grayscale(img), "#704214", "#C0A080")
    else:
        return jsonify({'error': 'Unsupported filter type'}), 400

    # Save the processed image to a BytesIO object
    img_io = io.BytesIO()
    img.save(img_io, 'JPEG')
    img_io.seek(0)

    # Return the processed image
    return send_file(img_io, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
