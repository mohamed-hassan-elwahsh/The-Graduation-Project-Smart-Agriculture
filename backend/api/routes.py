from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from api.schemas import AnalyzeRequest
from services.analysis_service import run_full_analysis
from services.image_analysis_service import run_image_analysis

router = APIRouter()

@router.post("/analyze")
async def analyze_region(req: AnalyzeRequest):
    """Analyze a region by coordinates (original endpoint)."""
    return run_full_analysis(req.lat, req.lng, req.radius_km)


@router.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    radius_km: float = Form(2.0),
):
    """
    Analyze an uploaded satellite image.
    Returns analysis data with base64 images for frontend display.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 50MB)")
    filename = file.filename or "uploaded_image.jpg"
    return run_image_analysis(file_bytes, filename, radius_km=radius_km)
