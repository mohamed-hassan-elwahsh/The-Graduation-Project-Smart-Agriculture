from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    lat: float
    lng: float
    radius_km: float = 2.0
