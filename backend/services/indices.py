import numpy as np
from typing import Dict, Any

def calculate_indices(data: Dict[str, Any]) -> Dict[str, np.ndarray]:
    """
    Calculates agricultural indices from Sentinel-2 bands.
    """
    b04 = data["B04"] # Red
    b08 = data["B08"] # NIR
    b11 = data["B11"] # SWIR
    
    # Safe division function to avoid div by zero
    def safe_div(a, b):
        with np.errstate(divide='ignore', invalid='ignore'):
            c = np.divide(a, b)
            c[~np.isfinite(c)] = 0
        return c

    # NDVI = (NIR - Red) / (NIR + Red)
    ndvi = safe_div(b08 - b04, b08 + b04)
    
    # NDWI (Water Index) = (Green/NIR - SWIR) / (Green/NIR + SWIR)
    # Using modified NDWI with SWIR (B11) often used for crops
    ndwi = safe_div(b08 - b11, b08 + b11)
    
    return {
        "NDVI": ndvi,
        "NDWI": ndwi
    }
