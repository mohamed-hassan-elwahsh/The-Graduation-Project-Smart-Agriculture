"""
Super Resolution Service — enhances satellite imagery quality.
Uses OpenCV's DNN Super Resolution with ESRGAN model.
Falls back to bicubic interpolation if model file is unavailable
or if cv2.dnn_superres is not available in the installed OpenCV version.
"""
import numpy as np
import cv2
from typing import Dict, Any
import os
import logging

logger = logging.getLogger(__name__)

ESRGAN_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "ESRGAN_x4.pb")
ESRGAN_DOWNLOAD_URL = "https://github.com/fann1998/opencv-super-resolution/releases/download/v1.0/ESRGAN_x4.pb"

_sr_model = None
_sr_loaded = False
_sr_available = True


def _ensure_model():
    """Download ESRGAN model if not present."""
    global _sr_loaded, _sr_available
    if _sr_loaded:
        return
    _sr_loaded = True
    if not hasattr(cv2, 'dnn_superres'):
        logger.warning("cv2.dnn_superres not available in this OpenCV version. Using bicubic fallback.")
        _sr_available = False
        return
    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(model_dir, exist_ok=True)
    if not os.path.exists(ESRGAN_MODEL_PATH):
        logger.info("Downloading ESRGAN model for super resolution...")
        import requests
        try:
            r = requests.get(ESRGAN_DOWNLOAD_URL, timeout=60, stream=True)
            with open(ESRGAN_MODEL_PATH, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            logger.info("ESRGAN model downloaded successfully.")
        except Exception as e:
            logger.warning(f"Could not download ESRGAN model: {e}. Will use bicubic fallback.")
            _sr_available = False


def _get_sr_model():
    """Lazily load the super resolution model."""
    global _sr_model
    if _sr_model is not None:
        return _sr_model
    _ensure_model()
    if not _sr_available:
        return None
    if os.path.exists(ESRGAN_MODEL_PATH):
        try:
            sr = cv2.dnn_superres.DnnSuperResImpl_create()
            sr.readModel(ESRGAN_MODEL_PATH)
            sr.setModel("esrgan", 4)
            _sr_model = sr
            logger.info("ESRGAN super resolution model loaded.")
        except Exception as e:
            logger.warning(f"Could not load ESRGAN model: {e}. Using bicubic fallback.")
            return None
    else:
        logger.warning("ESRGAN model file not found. Using bicubic fallback.")
    return _sr_model


def _bicubic_upscale(img_uint8: np.ndarray, scale: int) -> np.ndarray:
    """Bicubic upscaling with sharpening filter."""
    result = cv2.resize(img_uint8, (img_uint8.shape[1] * scale, img_uint8.shape[0] * scale),
                        interpolation=cv2.INTER_CUBIC)
    kernel = np.array([[-1, -1, -1],
                       [-1,  9, -1],
                       [-1, -1, -1]])
    result = cv2.filter2D(result, -1, kernel)
    logger.info(f"Bicubic upscaling: {img_uint8.shape[:2]} -> {result.shape[:2]}")
    return result


def enhance_image(image: np.ndarray, scale: int = 2) -> np.ndarray:
    """
    Enhance a satellite image using super resolution.
    Falls back to bicubic interpolation if ESRGAN is not available.
    """
    if image.max() <= 1.0:
        img_uint8 = (image * 255).astype(np.uint8)
    else:
        img_uint8 = image.astype(np.uint8)
    if img_uint8.ndim == 2:
        img_uint8 = np.stack([img_uint8] * 3, axis=-1)
    elif img_uint8.ndim == 3 and img_uint8.shape[2] == 1:
        img_uint8 = np.concatenate([img_uint8] * 3, axis=-1)
    sr = _get_sr_model()
    if sr is not None:
        try:
            if scale == 4:
                result = sr.upsample(img_uint8)
            else:
                result = sr.upsample(img_uint8)
                if scale != 4:
                    h, w = result.shape[:2]
                    new_h, new_w = h * scale // 4, w * scale // 4
                    result = cv2.resize(result, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
            logger.info(f"Super resolution: {img_uint8.shape[:2]} -> {result.shape[:2]}")
        except Exception as e:
            logger.warning(f"ESRGAN failed ({e}), using bicubic fallback.")
            result = _bicubic_upscale(img_uint8, scale)
    else:
        result = _bicubic_upscale(img_uint8, scale)
    result = result.astype(np.float32) / 255.0
    if image.ndim == 2 or (image.ndim == 3 and image.shape[2] == 1):
        result = result[:, :, 0]
    return result


def enhance_sentinel_bands(data: Dict[str, Any], scale: int = 2) -> Dict[str, Any]:
    """
    Enhance all Sentinel-2 bands using super resolution.
    Falls back to original bands if enhancement fails.
    """
    logger.info(f"Enhancing satellite imagery with {scale}x super resolution...")
    bands_to_enhance = ["B04", "B08", "B11"]
    for band in bands_to_enhance:
        if band in data:
            try:
                enhanced = enhance_image(data[band], scale=scale)
                data[band] = enhanced
            except Exception as e:
                logger.warning(f"Failed to enhance band {band}: {e}. Keeping original.")
    if "SCL" in data:
        scl = data["SCL"]
        h, w = scl.shape
        data["SCL"] = cv2.resize(scl, (w * scale, h * scale), interpolation=cv2.INTER_NEAREST)
    if "B04" in data:
        h, w = data["B04"].shape[:2]
        data["width"] = w
        data["height"] = h
    logger.info(f"Enhancement complete. New size: {data.get('width')}x{data.get('height')}")
    return data
