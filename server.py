"""
AI vs Your Eye - Backend Server (FINAL CLEAN VERSION)
Handles AVIF + OpenCV saliency safely
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
from pathlib import Path
from PIL import Image
import traceback

app = Flask(__name__)
CORS(app)

# Folders
UPLOAD_FOLDER = Path('uploads')
OUTPUT_FOLDER = Path('outputs')
UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(exist_ok=True)


@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        print("\n=== UPLOAD REQUEST RECEIVED ===")

        # Check file
        if 'image' not in request.files:
            print("ERROR: No image in request")
            return jsonify({'error': 'No image uploaded'}), 400

        file = request.files['image']
        print(f"File received: {file.filename}")

        if file.filename == '':
            print("ERROR: Empty filename")
            return jsonify({'error': 'Empty file'}), 400

        # Save original upload
        input_path = UPLOAD_FOLDER / 'input_original'
        file.save(str(input_path))

        # 🔥 Convert ANY format (AVIF, etc.) → JPG using Pillow
        converted_path = UPLOAD_FOLDER / 'input.jpg'
        try:
            pil_image = Image.open(str(input_path)).convert("RGB")
            pil_image.save(str(converted_path), format="JPEG")
            print("✓ Converted image to JPG")
        except Exception as e:
            print("ERROR converting image:", e)
            return jsonify({'error': 'Unsupported image format'}), 400

        # Read with OpenCV
        image = cv2.imread(str(converted_path))
        if image is None:
            print("ERROR: OpenCV still cannot read image")
            return jsonify({'error': 'Invalid image after conversion'}), 400

        height, width = image.shape[:2]
        print(f"Image size: {width}x{height}")

        # Saliency detection
        print("Running saliency detection...")
        saliency = cv2.saliency.StaticSaliencyFineGrained_create()
        success, saliency_map = saliency.computeSaliency(image)

        if not success:
            print("ERROR: Saliency detection failed")
            return jsonify({'error': 'Saliency failed'}), 500

        saliency_map = (saliency_map * 255).astype("uint8")

        # Find focal point
        _, _, _, max_loc = cv2.minMaxLoc(saliency_map)
        focal_x, focal_y = max_loc
        print(f"Focal point: ({focal_x}, {focal_y})")

        # Crop logic
        crop_w = int(width * 0.6)
        crop_h = int(height * 0.6)

        x1 = max(0, focal_x - crop_w // 2)
        y1 = max(0, focal_y - crop_h // 2)
        x2 = min(width, x1 + crop_w)
        y2 = min(height, y1 + crop_h)

        crop = image[y1:y2, x1:x2]

        print(f"Crop size: {crop.shape[1]}x{crop.shape[0]}")

        # Save result
        output_path = OUTPUT_FOLDER / 'result.jpg'
        cv2.imwrite(str(output_path), crop)

        print(f"✓ Saved result to: {output_path}")

        # Return JSON (frontend will fetch /result)
        return jsonify({
            'success': True,
            'message': 'Processed successfully'
        })

    except Exception as e:
        print("EXCEPTION:", e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/result', methods=['GET'])
def get_result():
    try:
        output_path = OUTPUT_FOLDER / 'result.jpg'
        if output_path.exists():
            return send_file(str(output_path), mimetype='image/jpeg')
        else:
            return jsonify({'error': 'No result found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'running'})


if __name__ == '__main__':
    print("🚀 Server running at http://127.0.0.1:5000")
    app.run(debug=True)