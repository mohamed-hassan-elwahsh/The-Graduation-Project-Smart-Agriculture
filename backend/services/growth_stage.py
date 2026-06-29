import numpy as np

def detect_growth_stage(ndvi: np.ndarray, crop_class: np.ndarray) -> np.ndarray:
    """
    Detects the growth stage based on NDVI values.
    Returns an array of integers:
    0: Not planted / Bare soil (NDVI < 0.15)
    1: Emergence / Seedling (0.15 <= NDVI < 0.35)
    2: Vegetative Growth (0.35 <= NDVI < 0.55)
    3: Reproductive / Maturing (0.55 <= NDVI < 0.75)
    4: Maturity / Ready to Harvest (NDVI >= 0.75)
    """
    stages = np.zeros_like(ndvi, dtype=np.uint8)
    
    # We only care about areas that are actually crops (crop_class > 0)
    
    # 1: Emergence
    m1 = (ndvi >= 0.15) & (ndvi < 0.35) & (crop_class > 0)
    # 2: Vegetative
    m2 = (ndvi >= 0.35) & (ndvi < 0.55) & (crop_class > 0)
    # 3: Reproductive
    m3 = (ndvi >= 0.55) & (ndvi < 0.75) & (crop_class > 0)
    # 4: Maturity
    m4 = (ndvi >= 0.75) & (crop_class > 0)
    
    stages[m1] = 1
    stages[m2] = 2
    stages[m3] = 3
    stages[m4] = 4
    
    return stages
