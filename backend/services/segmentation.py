import numpy as np
from typing import Dict, Any

def segment_agricultural_land(scl: np.ndarray, ndvi: np.ndarray) -> np.ndarray:
    """
    Segments agricultural land from the image.
    Returns a binary mask where 1 = Agricultural Land, 0 = Non-Agri.
    
    Logic:
    - SCL == 4 (Vegetation) OR SCL == 5 (Bare soils - could be plowed fields)
    - AND NDVI > 0.1 (Filtering out completely dead areas/urban)
    """
    # Create mask based on SCL
    vegetation_mask = (scl == 4) | (scl == 5)
    
    # Refine with NDVI
    active_mask = ndvi > 0.1
    
    # Combine
    agri_mask = vegetation_mask & active_mask
    
    return agri_mask.astype(np.uint8)
