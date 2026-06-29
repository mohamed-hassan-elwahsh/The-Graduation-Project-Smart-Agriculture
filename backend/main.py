from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import datetime
import random

from config import settings
from utils.geo import is_in_egypt, get_bounding_box
from services.sentinel import fetch_sentinel_data
from services.indices import calculate_indices
from services.segmentation import segment_agricultural_land
from services.classification import classify_crops
from services.growth_stage import detect_growth_stage
from services.recommendations import generate_insights, generate_alerts

app = FastAPI(title="AgroSat API")

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    lat: float
    lng: float
    radius_km: float = 2.0

@app.post("/api/analyze")
async def analyze_region(req: AnalyzeRequest):
    # 1. Validate coordinates
    if not is_in_egypt(req.lat, req.lng):
        # We can still proceed for demo purposes, but in reality we might block it.
        pass
        
    # 2. Get Bounding Box
    bbox = get_bounding_box(req.lat, req.lng, req.radius_km)
    
    # 3. Fetch Data (Simulated or Real depending on env vars)
    data = fetch_sentinel_data(bbox)
    
    # 4. Process Indices
    indices = calculate_indices(data)
    ndvi = indices["NDVI"]
    ndwi = indices["NDWI"]
    
    # 5. Segmentation
    agri_mask = segment_agricultural_land(data["SCL"], ndvi)
    
    # 6. Classification
    crop_classes = classify_crops(agri_mask, ndvi, ndwi)
    
    # 7. Growth Stage
    growth_stages = detect_growth_stage(ndvi, crop_classes)
    
    # 8. Compile Statistics and Build Regions Response
    # In a real app, we'd use connected components (e.g., skimage.measure.label)
    # to find distinct fields. Here we will mock the field grouping based on the classification results
    # to match the frontend expectations.
    
    # Calculate aggregate stats
    total_area = req.radius_km * req.radius_km * 3.14  # roughly
    agri_ratio = (agri_mask == 1).mean()
    rice_ratio = (crop_classes == 1).mean()
    
    agri_area = round(total_area * agri_ratio, 1)
    rice_area = round(total_area * rice_ratio, 1)
    avg_health = int(max(0, min(100, ndvi.mean() * 100 + 20))) # scaling to 0-100 roughly
    
    # Mocking fields based on the ratios
    regions = []
    crop_names = {1: "Rice", 2: "Wheat", 3: "Corn", 4: "Other"}
    
    # Generate a few random fields
    for i in range(1, 6):
        c_type = random.choice([1, 1, 2, 3, 4]) # Biased towards Rice
        health = random.randint(60, 95)
        ndvi_val = health / 100.0 - 0.1
        stage = 3 if ndvi_val > 0.55 else 2
        
        yield_en = f"{random.uniform(2.5, 4.5):.1f} ton/fd"
        yield_ar = f"{random.uniform(2.5, 4.5):.1f} طن/فدان"
        
        regions.append({
            "id": i,
            "l": f"{random.randint(5, 75)}%",
            "t": f"{random.randint(5, 75)}%",
            "w": f"{random.randint(15, 25)}%",
            "h": f"{random.randint(15, 25)}%",
            "crop": crop_names[c_type],
            "conf": random.randint(85, 98),
            "health": health,
            "feddan": random.randint(500, 3500),
            "ndvi": round(ndvi_val, 2),
            "stage": stage,
            "yieldEn": yield_en if c_type != 4 else "—",
            "yieldAr": yield_ar if c_type != 4 else "—",
            "wEn": f"{random.randint(800, 2200)} m³/ton" if c_type != 4 else "—",
            "wAr": f"{random.randint(800, 2200)} م³/طن" if c_type != 4 else "—"
        })
        
    insights = generate_insights(regions)
    alerts = generate_alerts(regions)
    
    return {
        "locEn": f"Lat: {req.lat:.4f}, Lng: {req.lng:.4f}",
        "locAr": f"خط العرض: {req.lat:.4f}، خط الطول: {req.lng:.4f}",
        "dateEn": datetime.datetime.now().strftime("%b %d, %Y · %H:%M UTC"),
        "dateAr": datetime.datetime.now().strftime("%d %m %Y · %H:%M"),
        "stats": [agri_area, rice_area, round(agri_area * 0.015, 2), avg_health, len(regions)],
        "regions": regions,
        "cropDist": [
            {"nEn": "Rice", "nAr": "أرز", "v": 45, "c": "#0ea5e9"},
            {"nEn": "Wheat", "nAr": "قمح", "v": 25, "c": "#f59e0b"},
            {"nEn": "Corn", "nAr": "ذرة", "v": 20, "c": "#10b981"},
            {"nEn": "Other", "nAr": "أخرى", "v": 10, "c": "#8b5cf6"}
        ],
        "vegTrend": [
            {"y": "2019", "v": 62}, {"y": "2020", "v": 67}, {"y": "2021", "v": 64},
            {"y": "2022", "v": 70}, {"y": "2023", "v": 68}, {"y": "2024", "v": 74}
        ],
        "waterTrend": [
            {"y": "2019", "w": 1.65}, {"y": "2020", "w": 1.72}, {"y": "2021", "w": 1.58},
            {"y": "2022", "w": 1.90}, {"y": "2023", "w": 1.75}, {"y": "2024", "w": 1.84}
        ],
        "insights": insights,
        "alerts": alerts
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=settings.debug)
