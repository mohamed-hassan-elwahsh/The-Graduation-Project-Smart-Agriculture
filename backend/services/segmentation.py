"""
Segmentation Service — uses pretrained U-Net with ResNet34 encoder
from segmentation_models_pytorch for land cover segmentation.

Classes:
  0: Background / Urban / Water
  1: Agricultural Land
  2: Built-up / Buildings
  3: Water bodies
  4: Bare soil / Roads

Falls back to SCL + NDVI thresholding if model is unavailable.
"""
import numpy as np
from typing import Dict, Any
import os
import logging

logger = logging.getLogger(__name__)

# Lazy-loaded model
_seg_model = None
_seg_loaded = False
_seg_device = None

# Class names for the segmentation output
SEG_CLASSES = {
    0: "Background",
    1: "Agricultural",
    2: "Built-up",
    3: "Water",
    4: "Bare Soil",
}


def _load_seg_model():
    """Lazily load the U-Net segmentation model."""
    global _seg_model, _seg_loaded, _seg_device
    if _seg_loaded:
        return _seg_model
    
    _seg_loaded = True
    
    try:
        import torch
        import segmentation_models_pytorch as smp
        
        _seg_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # U-Net with ResNet34 encoder pretrained on ImageNet
        model = smp.Unet(
            encoder_name="resnet34",
            encoder_weights="imagenet",
            in_channels=3,  # RGB: B04, B08, B11 as 3-channel
            classes=len(SEG_CLASSES),
        )
        model = model.to(_seg_device)
        model.eval()
        
        _seg_model = model
        logger.info(f"U-Net (ResNet34) segmentation model loaded on {_seg_device}")
        
    except ImportError:
        logger.warning("segmentation_models_pytorch or torch not installed. Using fallback segmentation.")
    except Exception as e:
        logger.warning(f"Could not load segmentation model: {e}. Using fallback.")
    
    return _seg_model


def _prepare_input(data: Dict[str, Any], target_size: int = 256) -> "torch.Tensor":
    """Prepare satellite bands as 3-channel input for the model."""
    import torch
    import cv2
    
    # Stack B04 (Red), B08 (NIR), B11 (SWIR) as 3 channels
    # This gives the model spectral information beyond visible RGB
    b04 = data["B04"]
    b08 = data["B08"]
    b11 = data["B11"]
    
    # Stack into (H, W, 3)
    img = np.stack([b04, b08, b11], axis=-1)
    
    # Normalize to [0, 1] — bands are already in [0, 1] after /10000
    # Clip outliers
    img = np.clip(img, 0, 1)
    
    # Resize to target_size for the model
    h, w = img.shape[:2]
    if h != target_size or w != target_size:
        img = cv2.resize(img, (target_size, target_size), interpolation=cv2.INTER_LINEAR)
    
    # Convert to (C, H, W) for PyTorch
    img = np.transpose(img, (2, 0, 1))
    img = np.ascontiguousarray(img)
    
    tensor = torch.from_numpy(img).float().unsqueeze(0)  # (1, C, H, W)
    return tensor


def segment_agricultural_land(scl: np.ndarray, ndvi: np.ndarray, data: Dict[str, Any] = None) -> np.ndarray:
    """
    Segments agricultural land from satellite imagery.
    
    Uses pretrained U-Net if available, otherwise falls back to
    SCL + NDVI thresholding.
    
    Returns a binary mask where 1 = Agricultural Land, 0 = Non-Agri.
    """
    model = _load_seg_model()
    
    if model is not None and data is not None:
        try:
            import torch
            import cv2
            
            original_shape = scl.shape
            target_size = 256
            
            # Prepare input
            tensor = _prepare_input(data, target_size=target_size)
            tensor = tensor.to(_seg_device)
            
            # Run inference
            with torch.no_grad():
                output = model(tensor)
                # Softmax to get probabilities
                probs = torch.softmax(output, dim=1)
                # Get predicted class per pixel
                pred = torch.argmax(probs, dim=1).squeeze(0).cpu().numpy()
            
            # Resize back to original size
            if pred.shape != original_shape:
                pred = cv2.resize(pred.astype(np.uint8), 
                                  (original_shape[1], original_shape[0]),
                                  interpolation=cv2.INTER_NEAREST)
            
            # Extract agricultural land (class 1)
            agri_mask = (pred == 1).astype(np.uint8)
            
            # Also extract bare soil (class 4) as potential agricultural land
            bare_soil = (pred == 4).astype(np.uint8)
            agri_mask = np.maximum(agri_mask, bare_soil)
            
            # Refine with NDVI (keep areas with some vegetation activity)
            active_mask = ndvi > 0.05  # Lower threshold to catch bare fields too
            agri_mask = agri_mask & active_mask
            
            logger.info(f"U-Net segmentation: {int(agri_mask.sum())} agricultural pixels out of {agri_mask.size}")
            return agri_mask
            
        except Exception as e:
            logger.warning(f"U-Net inference failed: {e}. Using fallback.")
    
    # Fallback: SCL + NDVI thresholding (original logic)
    logger.info("Using fallback SCL + NDVI segmentation.")
    vegetation_mask = (scl == 4) | (scl == 5)
    active_mask = ndvi > 0.1
    agri_mask = vegetation_mask & active_mask
    return agri_mask.astype(np.uint8)


def get_segmentation_map(scl: np.ndarray, ndvi: np.ndarray, data: Dict[str, Any] = None) -> np.ndarray:
    """
    Returns the full segmentation map with all classes (not just agricultural).
    
    Classes: 0=Background, 1=Agricultural, 2=Built-up, 3=Water, 4=Bare Soil
    """
    model = _load_seg_model()
    
    if model is not None and data is not None:
        try:
            import torch
            import cv2
            
            original_shape = scl.shape
            target_size = 256
            
            tensor = _prepare_input(data, target_size=target_size)
            tensor = tensor.to(_seg_device)
            
            with torch.no_grad():
                output = model(tensor)
                probs = torch.softmax(output, dim=1)
                pred = torch.argmax(probs, dim=1).squeeze(0).cpu().numpy()
            
            if pred.shape != original_shape:
                pred = cv2.resize(pred.astype(np.uint8),
                                  (original_shape[1], original_shape[0]),
                                  interpolation=cv2.INTER_NEAREST)
            
            return pred.astype(np.uint8)
        except Exception as e:
            logger.warning(f"U-Net full map failed: {e}. Using fallback.")
    
    # Fallback: derive from SCL
    seg_map = np.zeros_like(scl, dtype=np.uint8)
    seg_map[scl == 4] = 1  # Vegetation -> Agricultural
    seg_map[scl == 5] = 4  # Bare soil
    seg_map[scl == 6] = 3  # Water
    seg_map[scl == 2] = 2  # Built-up
    seg_map[scl == 7] = 2  # Built-up (unclassified)
    return seg_map
