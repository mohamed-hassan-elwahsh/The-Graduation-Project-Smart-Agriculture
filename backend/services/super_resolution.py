"""
Super Resolution Service — enhances satellite imagery quality.
Uses OpenCV's DNN Super Resolution with ESRGAN model.
Falls back to bicubic interpolation if model file is unavailable.
"""
import numpy as np
import cv2
from typing import Dict, Any
import os

# Path to ESRGAN model (downloaded if not present)
ESRGAN_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "ESRGAN_x4.pb")
ESRGAN_DOWNLOAD_URL = "https://github.com/fann1998/opencv-super-resolution/releases/download/v1.0/ESRGAN_x4.pb"

_sr_model = None
_sr_loaded = False


def _ensure_model():
    """Download ESRGAN model if not present."""
    global _sr_loaded
    if _sr_loaded:
        return
    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(model_dir, exist_ok=True)
    if not os.path.exists(ESRGAN_MODEL_PATH):
        print("Downloading ESRGAN model for super resolution...")
        import requests
        try:
            r = requests.get(ESRGAN_DOWNLOAD_URL, timeout=60, stream=True)
            with open(ESRGAN_MODEL_PATH, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            print("ESRGAN model downloaded successfully.")
        except Exception as e:
            print(f"Could not download ESRGAN model: {e}. Will use bicubic fallback.")
    _sr_loaded = True


def _get_sr_model():
    """Lazily load the super resolution model."""
    global _sr_model
    if _sr_model is not None:
        return _sr_model
    _ensure_model()
    if os.path.exists(ESRGAN_MODEL_PATH):
        sr = cv2.dnn_superres.DnnSuperResImpl_create()
        sr.readModel(ESRGAN_MODEL_PATH)
        sr.setModel("esrgan", 4)
        _sr_model = sr
        print("ESRGAN super resolution model loaded.")
    return _sr_model


def enhance_image(image: np.ndarray, scale: int = 2) -> np.ndarray:
    """
    Enhance a satellite image using super resolution.
    
    Args:
        image: Input image (H, W, C) with values in [0, 1] or [0, 255].
        scale: Upscale factor (2 or 4).
    
    Returns:
        Enhanced image with improved quality and resolution.
    """
    # Convert to uint8 for OpenCV
    if image.max() <= 1.0:
        img_uint8 = (image * 255).astype(np.uint8)
    else:
        img_uint8 = image.astype(np.uint8)
    
    # Handle single-channel images by converting to 3-channel
    if img_uint8.ndim == 2:
        img_uint8 = np.stack([img_uint8] * 3, axis=-1)
    elif img_uint8.shape[2] == 1:
        img_uint8 = np.concatenate([img_uint8] * 3, axis=-1)
    
    sr = _get_sr_model()
    
    if sr is not None:
        try:
            # Use ESRGAN for super resolution
            if scale == 4:
                result = sr.upsample(img_uint8)
            else:
                # ESRGAN is x4, so we upsample then downscale to desired scale
                result = sr.upsample(img_uint8)
                if scale != 4:
                    h, w = result.shape[:2]
                    new_h, new_w = h * scale // 4, w * scale // 4
                    result = cv2.resize(result, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
            print(f"Super resolution: {img_uint8.shape[:2]} -> {result.shape[:2]}")
        except Exception as e:
            print(f"ESRGAN failed ({e}), using bicubic fallback.")
            result = cv2.resize(img_uint8, (img_uint8.shape[1] * scale, img_uint8.shape[0] * scale),
                                interpolation=cv2.INTER_CUBIC)
    else:
        # Fallback: bicubic interpolation
        result = cv2.resize(img_uint8, (img_uint8.shape[1] * scale, img_uint8.shape[0] * scale),
                            interpolation=cv2.INTER_CUBIC)
        # Apply sharpening
        kernel = np.array([[-1, -1, -1],
                           [-1,  9, -1],
                           [-1, -1, -1]])
        result = cv2.filter2D(result, -1, kernel)
        print(f"Bicubic upscaling: {img_uint8.shape[:2]} -> {result.shape[:2]}")
    
    # Convert back to float [0, 1]
    result = result.astype(np.float32) / 255.0
    
    # If input was single-channel, convert back
    if image.ndim == 2 or (image.ndim == 3 and image.shape[2] == 1):
        result = result[:, :, 0]  # Take first channel
    
    return result


def enhance_sentinel_bands(data: Dict[str, Any], scale: int = 2) -> Dict[str, Any]:
    """
    Enhance all Sentinel-2 bands using super resolution.
    
    Args:
        data: Dictionary with keys B04, B08, B11, SCL, etc.
        scale: Upscale factor.
    
    Returns:
        Updated data dictionary with enhanced bands.
    """
    print(f"Enhancing satellite imagery with {scale}x super resolution...")
    
    bands_to_enhance = ["B04", "B08", "B11"]
    for band in bands_to_enhance:
        if band in data:
            enhanced = enhance_image(data[band], scale=scale)
            data[band] = enhanced
    
    # Enhance SCL with nearest-neighbor (it's a classification map, not continuous)
    if "SCL" in data:
        scl = data["SCL"]
        h, w = scl.shape
        data["SCL"] = cv2.resize(scl, (w * scale, h * scale), interpolation=cv2.INTER_NEAREST)
    
    # Update dimensions
    if "B04" in data:
        h, w = data["B04"].shape[:2]
        data["width"] = w
        data["height"] = h
    
    print(f"Enhancement complete. New size: {data.get('width')}x{data.get('height')}")
    return data
