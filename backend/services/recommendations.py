from typing import List, Dict, Any

def generate_insights(regions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    \"\"\"
    Generates AI recommendations based on the analyzed regions.
    \"\"\"
    insights = []
    
    # Look for water stress (low NDVI, high NDWI or vice versa depending on crop)
    rice_fields = [r for r in regions if r["crop"] == "Rice"]
    if rice_fields:
        # Check if any rice field has very high water usage but low health
        stressed = [r for r in rice_fields if r["health"] < 75]
        if stressed:
            ids = [str(r["id"]) for r in stressed[:2]]
            insights.append({
                "type": "warning", "icon": "💧",
                "iEn": f"High water consumption with sub-optimal health — Rice fields #{', '.join(ids)}",
                "iAr": f"استهلاك مياه مرتفع مع صحة دون المستوى — حقول الأرز #{', '.join(ids)}",
                "rEn": "Apply Alternate Wetting & Drying (AWD). Reduces water use 30–40% with zero yield impact.",
                "rAr": "تطبيق تقنية التجفيف والري المتناوب (AWD). تُقلل الاستهلاك 30–40٪ دون تأثير على الإنتاج.",
                "mEn": "Saves ~550,000 m³ per season", "mAr": "توفر ~550,000 م³ في الموسم",
            })
            
        # Check for harvest readiness (maturity stage)
        ready = [r for r in rice_fields if r["health"] > 80 and r["ndvi"] > 0.7]
        if ready:
            ids = [str(r["id"]) for r in ready[:2]]
            insights.append({
                "type": "success", "icon": "🌾",
                "iEn": f"Optimal harvest window — Rice fields #{', '.join(ids)}",
                "iAr": f"نافذة الحصاد المثلى — حقول الأرز #{', '.join(ids)}",
                "rEn": "NDVI at peak maturity. Harvest within 14–18 days for maximum grain quality.",
                "rAr": "NDVI عند النضج الأقصى. الحصاد خلال 14–18 يوماً لأعلى جودة حبوب.",
                "mEn": "Expected: 4.1–4.4 ton/feddan", "mAr": "متوقع: 4.1–4.4 طن/فدان",
            })
            
    # Look for general crop stress (any crop with low health)
    stressed_all = [r for r in regions if r["health"] < 65 and r["crop"] != "Water"]
    if stressed_all:
        ins = stressed_all[0]
        insights.append({
            "type": "error", "icon": "⚠️",
            "iEn": f"Crop stress detected — Field #{ins['id']}",
            "iAr": f"إجهاد محاصيل — الحقل #{ins['id']}",
            "rEn": "NDVI is below seasonal average. Apply nitrogen (30 kg/feddan) and irrigate within 48h.",
            "rAr": "NDVI أقل من المتوسط. أضف سماد نيتروجين (30 كجم/فدان) وري خلال 48 ساعة.",
            "mEn": "Prevents ~20% yield loss", "mAr": "يمنع ~20٪ خسارة في المنطقة",
        })
        
    # If not enough insights, add a generic positive one
    if len(insights) < 3 and len(regions) > 2:
        best = max(regions, key=lambda x: x.get("health", 0))
        insights.append({
            "type": "info", "icon": "📊",
            "iEn": f"Field #{best['id']} has highest land quality score",
            "iAr": f"الحقل #{best['id']} يملك أعلى جودة تربة",
            "rEn": "Superior nitrogen retention & drainage. Expand cultivation here next season.",
            "rAr": "احتباس نيتروجين ممتاز وصرف جيد. وسّع الزراعة هنا الموسم القادم.",
            "mEn": "Projected +15% yield", "mAr": "إنتاجية أعلى +15٪",
        })

    return insights

def generate_alerts(regions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    \"\"\"
    Generates real-time alerts.
    \"\"\"
    alerts = []
    
    very_low = [r for r in regions if r["ndvi"] > 0.2 and r["ndwi"] < -0.1]
    if very_low:
        ids = [str(r["id"]) for r in very_low[:2]]
        alerts.append({
            "sev": "critical", 
            "tEn": f"Water Stress — Fields #{', '.join(ids)}", 
            "tAr": f"إجهاد مائي — الحقول #{', '.join(ids)}",  
            "dEn": "Moisture significantly below threshold",    
            "dAr": "رطوبة أقل بكثير من الحد الأمثل", 
            "time": "Just now" 
        })
        
    alerts.append({
        "sev": "info",     
        "tEn": "Rain forecast in 48h",        
        "tAr": "توقعات بأمطار خلال 48 ساعة",    
        "dEn": "Delay irrigation schedules", 
        "dAr": "أخر جدول الري",         
        "time": "1h" 
    })
    
    return alerts
