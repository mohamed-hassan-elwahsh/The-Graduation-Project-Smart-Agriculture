"""
Segmentation Service — segments agricultural land from satellite imagery.

Uses rule-based SCL + NDVI thresholding as the primary method.
If a trained U-Net model file (.pth) exists in the models directory,
it will be used instead.

Classes:
  0: Background / Urban
  1: Agricultural Land
  2: Built-up / Buildings
  3: Water bodies
  4: Bare soil / Roads
"""
import numpy as np
from typing import Dict, Any
import os
import logging

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "segmentation_unet.pth")

_seg_model = None
_seg_loaded = False
_seg_device = None

SEG_CLASSES = {
    0: "Background",
    1: "Agricultural",
    2: "Built-up",
    3: "Water",
    4: "Bare Soil",
}


def _load_seg_model():
    """Lazily load a TRAINED U-Net model. Only loads if .pth file exists."""
    global _seg_model, _seg_loaded, _seg_device
    if _seg_loaded:
        return _seg_model
    _seg_loaded = True
    if not os.path.exists(MODEL_PATH):
        logger.info("No trained segmentation model found. Using rule-based segmentation.")
        return None
    try:
        import torch
        import segmentation_models_pytorch as smp
        _seg_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model = smp.Unet(
            encoder_name="resnet34",
            encoder_weights=None,
            in_channels=3,
            classes=len(SEG_CLASSES),
        )
        checkpoint = torch.load(MODEL_PATH, map_location=_seg_device)
        if isinstance(checkpoint, dict) and "model_state" in checkpoint:
            model.load_state_dict(checkpoint["model_state"])
        else:
            model.load_state_dict(checkpoint)
        model = model.to(_seg_device)
        model.eval()
        _seg_model = model
        logger.info(f"Trained U-Net segmentation model loaded from {MODEL_PATH} on {_seg_device}")
    except Exception as e:
        logger.warning(f"Could not load trained segmentation model: {e}. Using rule-based.")
    return _seg_model


def segment_agricultural_land(scl: np.ndarray, ndvi: np.ndarray, data: Dict[str, Any] = None) -> np.ndarray:
    """
    Segments agricultural land from satellite imagery.
    Uses trained U-Net if available, otherwise uses rule-based SCL + NDVI.
    Returns a binary mask where 1 = Agricultural Land, 0 = Non-Agri.
    """
    model = _load_seg_model()
    if model is not None and data is not None:
        try:
            import torch, cv2
            original_shape = scl.shape
            target_size = 256
            b04, b08, b11 = data["B04"], data["B08"], data["B11"]
            img = np.stack([b04, b08, b11], axis=-1)
            img = np.clip(img, 0, 1)
            h, w = img.shape[:2]
            if h != target_size or w != target_size:
                img = cv2.resize(img, (target_size, target_size), interpolation=cv2.INTER_LINEAR)
            img = np.transpose(img, (2, 0, 1))
            img = np.ascontiguousarray(img)
            tensor = torch.from_numpy(img).float().unsqueeze(0).to(_seg_device)
            with torch.no_grad():
                output = model(tensor)
                probs = torch.softmax(output, dim=1)
                pred = torch.argmax(probs, dim=1).squeeze(0).cpu().numpy()
            if pred.shape != original_shape:
                pred = cv2.resize(pred.astype(np.uint8), (original_shape[1], original_shape[0]), interpolation=cv2.INTER_NEAREST)
            agri_mask = (pred == 1).astype(np.uint8)
            bare_soil = (pred == 4).astype(np.uint8)
            agri_mask = np.maximum(agri_mask, bare_soil)
            active_mask = ndvi > 0.05
            agri_mask = agri_mask & active_mask
            logger.info(f"U-Net segmentation: {int(agri_mask.sum())} agricultural pixels")
            return agri_mask
        except Exception as e:
            logger.warning(f"U-Net inference failed: {e}. Using rule-based.")
    return _rule_based_segmentation(scl, ndvi)


def get_segmentation_map(scl: np.ndarray, ndvi: np.ndarray, data: Dict[str, Any] = None) -> np.ndarray:
    """Returns the full segmentation map with all classes."""
    model = _load_seg_model()
    if model is not None and data is not None:
        try:
            import torch, cv2
            original_shape = scl.shape
            target_size = 256
            b04, b08, b11 = data["B04"], data["B08"], data["B11"]
            img = np.stack([b04, b08, b11], axis=-1)
            img = np.clip(img, 0, 1)
            h, w = img.shape[:2]
            if h != target_size or w != target_size:
                img = cv2.resize(img, (target_size, target_size), interpolation=cv2.INTER_LINEAR)
            img = np.transpose(img, (2, 0, 1))
            img = np.ascontiguousarray(img)
            tensor = torch.from_numpy(img).float().unsqueeze(0).to(_seg_device)
            with torch.no_grad():
                output = model(tensor)
                probs = torch.softmax(output, dim=1)
                pred = torch.argmax(probs, dim=1).squeeze(0).cpu().numpy()
            if pred.shape != original_shape:
                pred = cv2.resize(pred.astype(np.uint8), (original_shape[1], original_shape[0]), interpolation=cv2.INTER_NEAREST)
            return pred.astype(np.uint8)
        except Exception as e:
            logger.warning(f"U-Net full map failed: {e}. Using rule-based.")
    return _rule_based_seg_map(scl, ndvi)


def _rule_based_segmentation(scl: np.ndarray, ndvi: np.ndarray) -> np.ndarray:
    """Rule-based segmentation using SCL + NDVI thresholds."""
    vegetation_mask = (scl == 4) | (scl == 5)
    active_mask = ndvi > 0.1
    agri_mask = vegetation_mask & active_mask
    logger.info(f"Rule-based segmentation: {int(agri_mask.sum())} agricultural pixels out of {agri_mask.size}")
    return agri_mask.astype(np.uint8)


def _rule_based_seg_map(scl: np.ndarray, ndvi: np.ndarray) -> np.ndarray:
    """Rule-based full segmentation map."""
    seg_map = np.zeros_like(scl, dtype=np.uint8)
    seg_map[scl == 6] = 3
    seg_map[(ndvi < -0.1) & (scl != 6)] = 3
    seg_map[(scl == 2) | (scl == 7)] = 2
    seg_map[(ndvi < 0.0) & (ndvi >= -0.1) & (scl != 6)] = 2
    seg_map[(scl == 4) & (ndvi > 0.1)] = 1
    seg_map[(scl == 5) & (ndvi > 0.05)] = 1
    seg_map[(scl == 5) & (ndvi <= 0.05)] = 4
    remaining = (seg_map == 0)
    seg_map[remaining & (ndvi > 0.3)] = 1
    seg_map[remaining & (ndvi >= 0.0) & (ndvi <= 0.3)] = 4
    seg_map[remaining & (ndvi < 0.0)] = 2
    logger.info(f"Rule-based seg map: {dict(zip(*np.unique(seg_map, return_counts=True)))}")
    return seg_map
