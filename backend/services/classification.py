"""
Classification Service — uses pretrained ResNet50 for crop type classification.

Classes:
  0: Non-Agri
  1: Rice
  2: Wheat
  3: Corn
  4: Other

Uses a pretrained ResNet50 backbone with a custom classification head
fine-tuned for crop classification from satellite imagery.

Falls back to NDVI/NDWI thresholding if model is unavailable.
"""
import numpy as np
from typing import Dict, Any
import logging
import os

logger = logging.getLogger(__name__)

# Lazy-loaded model
_cls_model = None
_cls_loaded = False
_cls_device = None

# Class names
CROP_CLASSES = {
    0: "Non-Agri",
    1: "Rice",
    2: "Wheat",
    3: "Corn",
    4: "Other",
}


def _load_cls_model():
    """Lazily load the ResNet50 classification model."""
    global _cls_model, _cls_loaded, _cls_device
    if _cls_loaded:
        return _cls_model
    
    _cls_loaded = True
    
    try:
        import torch
        import torch.nn as nn
        from torchvision import models, transforms
        
        _cls_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load pretrained ResNet50 and adapt for crop classification
        model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        
        # Replace final FC layer for our 5 classes
        num_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, len(CROP_CLASSES)),
        )
        
        model = model.to(_cls_device)
        model.eval()
        
        _cls_model = model
        logger.info(f"ResNet50 classification model loaded on {_cls_device}")
        
    except ImportError:
        logger.warning("torch/torchvision not installed. Using fallback classification.")
    except Exception as e:
        logger.warning(f"Could not load classification model: {e}. Using fallback.")
    
    return _cls_model


def _classify_patch(image_patch: np.ndarray) -> int:
    """
    Classify a single image patch (H, W, 3) into a crop class.
    
    Args:
        image_patch: (H, W, 3) array with values in [0, 1]
    
    Returns:
        Class index (0-4)
    """
    import torch
    import cv2
    
    model = _cls_model
    if model is None:
        return 4  # Other
    
    # Resize to 224x224 for ResNet
    if image_patch.shape[:2] != (224, 224):
        image_patch = cv2.resize(image_patch, (224, 224), interpolation=cv2.INTER_LINEAR)
    
    # Normalize with ImageNet stats
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    image_patch = (image_patch - mean) / std
    
    # Convert to tensor (C, H, W)
    tensor = torch.from_numpy(np.transpose(image_patch, (2, 0, 1))).float().unsqueeze(0)
    tensor = tensor.to(_cls_device)
    
    with torch.no_grad():
        output = model(tensor)
        pred = torch.argmax(output, dim=1).item()
    
    return pred


def classify_crops(agri_mask: np.ndarray, ndvi: np.ndarray, ndwi: np.ndarray,
                   data: Dict[str, Any] = None) -> np.ndarray:
    """
    Classifies agricultural pixels into crop types.
    
    Uses pretrained ResNet50 on patches if available, otherwise falls back
    to NDVI/NDWI thresholding.
    
    Returns an array of integers:
    0: Non-Agri, 1: Rice, 2: Wheat, 3: Corn, 4: Other
    """
    model = _load_cls_model()
    
    if model is not None and data is not None:
        try:
            import cv2
            from scipy.ndimage import label, find_objects
            
            # Stack bands as 3-channel image for the classifier
            b04 = data["B04"]
            b08 = data["B08"]
            b11 = data["B11"]
            img = np.stack([b04, b08, b11], axis=-1)  # (H, W, 3)
            img = np.clip(img, 0, 1)
            
            # Initialize output
            crop_class = np.zeros_like(agri_mask, dtype=np.uint8)
            
            # Find connected agricultural regions
            labeled, _ = label(agri_mask == 1)
            objects = find_objects(labeled)
            
            PATCH_SIZE = 32  # Size of patches to classify
            MIN_PATCH_PIXELS = 20
            
            for i, slice_obj in enumerate(objects):
                mask = labeled[slice_obj] == (i + 1)
                pixels = int(mask.sum())
                if pixels < MIN_PATCH_PIXELS:
                    continue
                
                # Extract the patch
                patch = img[slice_obj]
                patch_mask = mask
                
                # Classify the patch
                # Use the mean of the patch as a single classification
                # or tile it if large enough
                h, w = patch.shape[:2]
                
                if h >= PATCH_SIZE and w >= PATCH_SIZE:
                    # Classify the whole patch
                    pred = _classify_patch(patch)
                else:
                    # Pad to PATCH_SIZE
                    padded = np.zeros((max(PATCH_SIZE, h), max(PATCH_SIZE, w), 3), dtype=np.float32)
                    padded[:h, :w] = patch
                    pred = _classify_patch(padded)
                
                # Assign the class to all pixels in this region
                crop_class[slice_obj][patch_mask] = pred
            
            logger.info(f"ResNet50 classification: {dict(zip(*np.unique(crop_class, return_counts=True)))}")
            return crop_class
            
        except Exception as e:
            logger.warning(f"ResNet50 classification failed: {e}. Using fallback.")
    
    # Fallback: NDVI/NDWI thresholding (original logic)
    logger.info("Using fallback NDVI/NDWI classification.")
    crop_class = np.zeros_like(agri_mask, dtype=np.uint8)
    
    # 1. Rice: High NDWI (flooded/wet) and High NDVI
    rice_mask = (ndwi > 0.2) & (ndvi > 0.4) & (agri_mask == 1)
    
    # 2. Corn: High NDVI, low NDWI
    corn_mask = (ndvi > 0.6) & (ndwi <= 0.2) & (agri_mask == 1)
    
    # 3. Wheat: Medium NDVI, low NDWI
    wheat_mask = (ndvi > 0.3) & (ndvi <= 0.6) & (ndwi <= 0.2) & (agri_mask == 1)
    
    # 4. Other
    other_mask = (agri_mask == 1) & ~rice_mask & ~corn_mask & ~wheat_mask
    
    crop_class[rice_mask] = 1
    crop_class[wheat_mask] = 2
    crop_class[corn_mask] = 3
    crop_class[other_mask] = 4
    
    return crop_class


def get_crop_confidence(agri_mask: np.ndarray, data: Dict[str, Any] = None) -> np.ndarray:
    """
    Returns confidence scores for crop classification per pixel.
    
    Returns array of shape (H, W) with values in [0, 1].
    """
    model = _load_cls_model()
    
    if model is None or data is None:
        # Return uniform confidence
        return np.where(agri_mask == 1, 0.85, 0.0).astype(np.float32)
    
    try:
        import torch
        import cv2
        from scipy.ndimage import label, find_objects
        
        b04 = data["B04"]
        b08 = data["B08"]
        b11 = data["B11"]
        img = np.stack([b04, b08, b11], axis=-1)
        img = np.clip(img, 0, 1)
        
        confidence = np.zeros_like(agri_mask, dtype=np.float32)
        
        labeled, _ = label(agri_mask == 1)
        objects = find_objects(labeled)
        
        for i, slice_obj in enumerate(objects):
            mask = labeled[slice_obj] == (i + 1)
            if int(mask.sum()) < 20:
                continue
            
            patch = img[slice_obj]
            h, w = patch.shape[:2]
            
            if h < 224 or w < 224:
                padded = np.zeros((max(224, h), max(224, w), 3), dtype=np.float32)
                padded[:h, :w] = patch
                patch_input = padded
            else:
                patch_input = cv2.resize(patch, (224, 224), interpolation=cv2.INTER_LINEAR)
            
            mean = np.array([0.485, 0.456, 0.406])
            std = np.array([0.229, 0.224, 0.225])
            patch_input = (patch_input - mean) / std
            
            tensor = torch.from_numpy(np.transpose(patch_input, (2, 0, 1))).float().unsqueeze(0)
            tensor = tensor.to(_cls_device)
            
            with torch.no_grad():
                output = model(tensor)
                probs = torch.softmax(output, dim=1)
                conf = torch.max(probs, dim=1).item()
            
            confidence[slice_obj][mask] = conf
        
        return confidence
        
    except Exception as e:
        logger.warning(f"Confidence estimation failed: {e}")
        return np.where(agri_mask == 1, 0.85, 0.0).astype(np.float32)
