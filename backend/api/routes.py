from fastapi import APIRouter
from api.schemas import AnalyzeRequest
from services.analysis_service import run_full_analysis

router = APIRouter()

@router.post("/analyze")
async def analyze_region(req: AnalyzeRequest):
    return run_full_analysis(req.lat, req.lng, req.radius_km)
