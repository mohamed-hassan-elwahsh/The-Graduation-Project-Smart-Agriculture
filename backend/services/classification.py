import numpy as np
from typing import Dict, Any

def classify_crops(agri_mask: np.ndarray, ndvi: np.ndarray, ndwi: np.ndarray) -> np.ndarray:
    """
    Classifies agricultural pixels into crop types.
    Returns an array of integers representing classes:
    0: Non-Agri
    1: Rice
    2: Wheat
    3: Corn
    4: Other
    """
    # Initialize output with 0 (Non-Agri)
    crop_class = np.zeros_like(agri_mask, dtype=np.uint8)
    
    # Only classify pixels within the agricultural mask
    
    # 1. Rice: High NDWI (flooded/wet) and High NDVI
    rice_mask = (ndwi > 0.2) & (ndvi > 0.4) & (agri_mask == 1)
    
    # 2. Wheat/Corn: Separated by NDVI thresholds (simplified)
    # In reality, this requires multi-temporal data (time series).
    # For single-date demo:
    corn_mask = (ndvi > 0.6) & (ndwi <= 0.2) & (agri_mask == 1)
    wheat_mask = (ndvi > 0.3) & (ndvi <= 0.6) & (ndwi <= 0.2) & (agri_mask == 1)
    
    # 4. Other: Everything else in the agri mask
    other_mask = (agri_mask == 1) & ~rice_mask & ~corn_mask & ~wheat_mask
    
    crop_class[rice_mask] = 1
    crop_class[wheat_mask] = 2
    crop_class[corn_mask] = 3
    crop_class[other_mask] = 4
    
    return crop_class
