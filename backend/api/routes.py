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
    lat: float = Form(None),
    lng: float = Form(None),
    radius_km: float = Form(2.0),
):
    """
    Analyze an uploaded satellite image.
    
    Accepts:
    - file: Satellite image (JPG, PNG, or multi-band TIFF)
    - lat: Optional latitude for geo-referencing
    - lng: Optional longitude for geo-referencing
    - radius_km: Estimated area radius in km (default: 2.0)
    
    Returns the same AnalysisData structure as /analyze.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Read file bytes
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    
    # Check file size (max 50MB)
    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 50MB)")
    
    filename = file.filename or "uploaded_image.jpg"
    
    # Run the image analysis pipeline
    return run_image_analysis(file_bytes, filename, lat, lng, radius_km)
