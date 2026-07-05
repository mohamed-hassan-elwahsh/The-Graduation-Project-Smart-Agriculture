"""
Image Upload Service — processes user-uploaded satellite imagery.
Replaces the coordinate-based Sentinel-2 fetch with direct image upload.
Extracts multi-band data from uploaded images and prepares them for the ML pipeline.
"""
import numpy as np
import cv2
from typing import Dict, Any
import logging
import os
import tempfile

logger = logging.getLogger(__name__)


def process_uploaded_image(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Process an uploaded satellite image and extract band-like data
    for the ML pipeline.
    
    Accepts:
    - RGB images (JPG/PNG) — extracts pseudo-bands from RGB channels
    - Multi-band TIFF images — extracts actual spectral bands if available
    
    Returns a data dict compatible with the existing pipeline:
    {
        "B04": np.ndarray,  # Red band
        "B08": np.ndarray,  # NIR band (synthesized from RGB if not available)
        "B11": np.ndarray,  # SWIR band (synthesized from RGB if not available)
        "SCL": np.ndarray,  # Scene Classification Layer (derived)
        "width": int,
        "height": int,
        "image_date": None,  # Unknown for user uploads
    }
    """
    # Save to temp file for processing
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name
    
    try:
        # Try reading as a multi-band TIFF first (rasterio)
        try:
            import rasterio
            with rasterio.open(tmp_path) as src:
                num_bands = src.count
                logger.info(f"Opened TIFF with {num_bands} bands, size: {src.width}x{src.height}")
                
                if num_bands >= 4:
                    # Multi-band satellite image — map bands to B04, B08, B11
                    # Common band ordering: B2(Blue), B3(Green), B4(Red), B8(NIR), B11(SWIR)
                    bands = [src.read(i + 1) for i in range(min(num_bands, 5))]
                    
                    # Normalize to [0, 1] — assume 16-bit or 8-bit
                    def normalize(band):
                        if band.dtype == np.uint16:
                            return band.astype(np.float32) / 65535.0
                        elif band.dtype == np.uint8:
                            return band.astype(np.float32) / 255.0
                        else:
                            return band.astype(np.float32)
                    
                    # Map bands (adjust based on actual satellite data)
                    b04 = normalize(bands[2]) if len(bands) > 2 else normalize(bands[0])  # Red
                    b08 = normalize(bands[3]) if len(bands) > 3 else normalize(bands[1])  # NIR
                    b11 = normalize(bands[4]) if len(bands) > 4 else normalize(bands[2])  # SWIR
                    
                    # Generate SCL from NDVI thresholding
                    ndvi = _safe_div(b08 - b04, b08 + b04)
                    scl = _derive_scl(ndvi, b04, b08)
                    
                    h, w = b04.shape
                    logger.info(f"Processed multi-band TIFF: {w}x{h}")
                    
                    return {
                        "B04": b04,
                        "B08": b08,
                        "B11": b11,
                        "SCL": scl,
                        "width": w,
                        "height": h,
                        "image_date": None,
                    }
        except Exception as e:
            logger.info(f"Not a multi-band TIFF ({e}), processing as RGB image...")
        
        # Fallback: process as regular RGB image (JPG/PNG)
        img = cv2.imread(tmp_path, cv2.IMREAD_COLOR)
        if img is None:
            # Try with IMREAD_UNCHANGED for images with alpha channel
            img = cv2.imread(tmp_path, cv2.IMREAD_UNCHANGED)
            if img is None:
                raise ValueError(f"Could not read image: {filename}")
        
        # Convert BGR to RGB
        if img.ndim == 3 and img.shape[2] >= 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        h, w = img.shape[:2]
        logger.info(f"Processing RGB image: {w}x{h}")
        
        # Normalize to [0, 1]
        img_float = img.astype(np.float32) / 255.0
        
        # Extract channels
        if img_float.ndim == 2:
            # Grayscale — replicate to 3 channels
            r = g = b = img_float
        else:
            r = img_float[:, :, 0]  # Red
            g = img_float[:, :, 1]  # Green
            b = img_float[:, :, 2]  # Blue
        
        # Synthesize pseudo-bands from RGB:
        # B04 (Red) = R channel directly
        b04 = r
        
        # B08 (NIR) — synthesize from near-infrared approximation
        # NIR correlates with (R + IR), we approximate using vegetation index
        # A common approximation: NIR ≈ 2*R - B (for vegetation areas)
        # Better: use a vegetation-based synthesis
        b08 = np.clip(0.5 * r + 0.8 * g + 0.3 * b, 0, 1)
        # Boost vegetation areas (high green, low red)
        veg_mask = (g > r) & (g > b)
        b08[veg_mask] = np.clip(b08[veg_mask] * 1.5, 0, 1)
        
        # B11 (SWIR) — synthesize from RGB
        # SWIR correlates with soil moisture and dry vegetation
        # Approximation: SWIR ≈ 0.3*R + 0.3*G + 0.7*B (blue absorbs more in SWIR)
        b11 = np.clip(0.3 * r + 0.3 * g + 0.5 * b, 0, 1)
        
        # Generate SCL (Scene Classification Layer) from NDVI
        ndvi = _safe_div(b08 - b04, b08 + b04)
        scl = _derive_scl(ndvi, b04, b08)
        
        logger.info(f"Processed RGB image into pseudo-bands: {w}x{h}")
        
        return {
            "B04": b04,
            "B08": b08,
            "B11": b11,
            "SCL": scl,
            "width": w,
            "height": h,
            "image_date": None,
        }
        
    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


def _safe_div(a, b):
    """Safe division avoiding divide by zero."""
    with np.errstate(divide='ignore', invalid='ignore'):
        c = np.divide(a, b)
        c[np.isfinite(c)] = 0
    return c


def _derive_scl(ndvi: np.ndarray, b04: np.ndarray, b08: np.ndarray) -> np.ndarray:
    """
    Derive a pseudo Scene Classification Layer from NDVI and band values.
    
    SCL classes (Sentinel-2 convention):
    0: No Data
    1: Saturated/Defective
    2: Dark Area Pixels / Built-up (shadows)
    3: Cloud Shadows
    4: Vegetation
    5: Bare Soils
    6: Water
    7: Unclassified
    8: Cloud Medium Probability
    9: Cloud High Probability
    10: Thin Cirrus
    11: Snow/Ice
    """
    scl = np.full(ndvi.shape, 7, dtype=np.uint8)  # Default: Unclassified
    
    # Water: very low NIR and low NDVI
    water_mask = (b08 < 0.15) & (ndvi < 0.0)
    scl[water_mask] = 6
    
    # Vegetation: high NDVI
    veg_mask = ndvi > 0.3
    scl[veg_mask] = 4
    
    # Bare soil: low NDVI but not water
    bare_mask = (ndvi >= 0.0) & (ndvi <= 0.3) & ~water_mask
    scl[bare_mask] = 5
    
    # Built-up: very low NDVI and moderate brightness
    builtup_mask = (ndvi < 0.0) & (b04 > 0.15) & ~water_mask
    scl[builtup_mask] = 2
    
    return scl


def process_uploaded_image_with_coords(
    file_bytes: bytes, 
    filename: str, 
    lat: float, 
    lng: float, 
    radius_km: float
) -> Dict[str, Any]:
    """
    Process an uploaded image with optional coordinates for geo-referencing.
    
    If coordinates are provided, the image will be geo-referenced and
    historical NDVI data can still be fetched from Sentinel-2 archive.
    """
    data = process_uploaded_image(file_bytes, filename)
    
    # Add geo-reference info if coordinates provided
    if lat is not None and lng is not None:
        data["lat"] = lat
        data["lng"] = lng
        data["radius_km"] = radius_km
    
    return data
