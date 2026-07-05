"""
Classification Service — classifies crop types from satellite imagery.

Uses rule-based NDVI/NDWI thresholding as the primary method.
If a trained ResNet50 model file (.pth) exists, it will be used instead.

Classes:
  0: Non-Agri
  1: Rice
  2: Wheat
  3: Corn
  4: Other
"""
import numpy as np
from typing import Dict, Any
import logging
import os

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "classification_resnet50.pth")

_cls_model = None
_cls_loaded = False
_cls_device = None

CROP_CLASSES = {
    0: "Non-Agri",
    1: "Rice",
    2: "Wheat",
    3: "Corn",
    4: "Other",
}


def _load_cls_model():
    """Lazily load a TRAINED ResNet50 model. Only loads if .pth file exists."""
    global _cls_model, _cls_loaded, _cls_device
    if _cls_loaded:
        return _cls_model
    _cls_loaded = True
    if not os.path.exists(MODEL_PATH):
        logger.info("No trained classification model found. Using rule-based classification.")
        return None
    try:
        import torch
        import torch.nn as nn
        from torchvision import models
        _cls_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model = models.resnet50(weights=None)
        num_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, len(CROP_CLASSES)),
        )
        checkpoint = torch.load(MODEL_PATH, map_location=_cls_device)
        if isinstance(checkpoint, dict) and "model_state" in checkpoint:
            model.load_state_dict(checkpoint["model_state"])
        else:
            model.load_state_dict(checkpoint)
        model = model.to(_cls_device)
        model.eval()
        _cls_model = model
        logger.info(f"Trained ResNet50 model loaded from {MODEL_PATH} on {_cls_device}")
    except Exception as e:
        logger.warning(f"Could not load trained classification model: {e}. Using rule-based.")
    return _cls_model


def classify_crops(agri_mask: np.ndarray, ndvi: np.ndarray, ndwi: np.ndarray, data: Dict[str, Any] = None) -> np.ndarray:
    """
    Classifies agricultural pixels into crop types.
    Uses trained ResNet50 if available, otherwise uses NDVI/NDWI thresholding.
    Returns: 0=Non-Agri, 1=Rice, 2=Wheat, 3=Corn, 4=Other
    """
    model = _load_cls_model()
    if model is not None and data is not None:
        try:
            import cv2
            from scipy.ndimage import label, find_objects
            b04, b08, b11 = data["B04"], data["B08"], data["B11"]
            img = np.stack([b04, b08, b11], axis=-1)
            img = np.clip(img, 0, 1)
            crop_class = np.zeros_like(agri_mask, dtype=np.uint8)
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
                import torch
                mean = np.array([0.485, 0.456, 0.406])
                std = np.array([0.229, 0.224, 0.225])
                patch_input = (patch_input - mean) / std
                tensor = torch.from_numpy(np.transpose(patch_input, (2, 0, 1))).float().unsqueeze(0).to(_cls_device)
                with torch.no_grad():
                    output = model(tensor)
                    pred = torch.argmax(output, dim=1).item()
                crop_class[slice_obj][mask] = pred
            logger.info(f"ResNet50 classification: {dict(zip(*np.unique(crop_class, return_counts=True)))}")
            return crop_class
        except Exception as e:
            logger.warning(f"ResNet50 classification failed: {e}. Using rule-based.")
    return _rule_based_classification(agri_mask, ndvi, ndwi)


def get_crop_confidence(agri_mask: np.ndarray, data: Dict[str, Any] = None) -> np.ndarray:
    """Returns confidence scores per pixel."""
    model = _load_cls_model()
    if model is None or data is None:
        return np.where(agri_mask == 1, 0.85, 0.0).astype(np.float32)
    try:
        import torch, cv2
        from scipy.ndimage import label, find_objects
        b04, b08, b11 = data["B04"], data["B08"], data["B11"]
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
            tensor = torch.from_numpy(np.transpose(patch_input, (2, 0, 1))).float().unsqueeze(0).to(_cls_device)
            with torch.no_grad():
                output = model(tensor)
                probs = torch.softmax(output, dim=1)
                conf = torch.max(probs, dim=1).item()
            confidence[slice_obj][mask] = conf
        return confidence
    except Exception as e:
        logger.warning(f"Confidence estimation failed: {e}")
        return np.where(agri_mask == 1, 0.85, 0.0).astype(np.float32)


def _rule_based_classification(agri_mask: np.ndarray, ndvi: np.ndarray, ndwi: np.ndarray) -> np.ndarray:
    """Rule-based crop classification using NDVI/NDWI thresholds."""
    crop_class = np.zeros_like(agri_mask, dtype=np.uint8)
    rice_mask = (ndwi > 0.2) & (ndvi > 0.4) & (agri_mask == 1)
    corn_mask = (ndvi > 0.6) & (ndwi <= 0.2) & (agri_mask == 1)
    wheat_mask = (ndvi > 0.3) & (ndvi <= 0.6) & (ndwi <= 0.2) & (agri_mask == 1)
    other_mask = (agri_mask == 1) & ~rice_mask & ~corn_mask & ~wheat_mask
    crop_class[rice_mask] = 1
    crop_class[wheat_mask] = 2
    crop_class[corn_mask] = 3
    crop_class[other_mask] = 4
    logger.info(f"Rule-based classification: {dict(zip(*np.unique(crop_class, return_counts=True)))}")
    return crop_class
