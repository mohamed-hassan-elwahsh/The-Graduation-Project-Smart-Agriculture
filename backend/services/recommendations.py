"""
AI Recommendations Service — uses LLM (OpenAI/Gemini) for generating
agricultural insights, recommendations, and alerts.

Falls back to rule-based recommendations if no API key is configured.
"""
import os
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Check for available LLM API keys
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")


def _call_openai(prompt: str, system: str = "") -> str:
    """Call OpenAI API for recommendations."""
    from openai import OpenAI
    client = OpenAI()
    
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7,
        max_tokens=1500,
    )
    return response.choices[0].message.content


def _call_gemini(prompt: str, system: str = "") -> str:
    """Call Google Gemini API for recommendations."""
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    
    model = genai.GenerativeModel("gemini-1.5-flash")
    full_prompt = f"{system}\n\n{prompt}" if system else prompt
    response = model.generate_content(full_prompt)
    return response.text


def _call_llm(prompt: str, system: str = "") -> str:
    """Call whichever LLM is available."""
    if OPENAI_API_KEY:
        return _call_openai(prompt, system)
    elif GEMINI_API_KEY:
        return _call_gemini(prompt, system)
    raise ValueError("No LLM API key configured")


def _parse_llm_response(text: str) -> List[Dict[str, Any]]:
    """Parse LLM JSON response into insights list."""
    try:
        # Try to extract JSON from the response
        text = text.strip()
        if text.startswith("```"):
            # Remove markdown code fences
            text = text.split("\n", 1)[1] if "\n" in text else text
            text = text.rsplit("```", 1)[0]
        
        data = json.loads(text)
        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and "insights" in data:
            return data["insights"]
        else:
            return [data]
    except json.JSONDecodeError:
        # If JSON parsing fails, create a single insight from the text
        return [{
            "type": "info",
            "icon": "💡",
            "iEn": text[:500],
            "iAr": text[:500],
            "rEn": "",
            "rAr": "",
            "mEn": "",
            "mAr": "",
        }]


def generate_insights(regions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates AI-powered recommendations based on the analyzed regions.
    
    Uses LLM (OpenAI/Gemini) if API key is available,
    otherwise falls back to rule-based recommendations.
    """
    if not OPENAI_API_KEY and not GEMINI_API_KEY:
        logger.info("No LLM API key found. Using rule-based recommendations.")
        return _rule_based_insights(regions)
    
    try:
        # Prepare summary of regions for the LLM
        rice_fields = [r for r in regions if r.get("crop") == "Rice"]
        all_fields = regions
        
        summary = {
            "total_fields": len(all_fields),
            "rice_fields": len(rice_fields),
            "fields": [
                {
                    "id": r.get("id"),
                    "crop": r.get("crop"),
                    "health": r.get("health"),
                    "ndvi": r.get("ndvi"),
                    "ndwi": r.get("ndwi"),
                    "stage": r.get("stage"),
                    "feddan": r.get("feddan"),
                    "yield": r.get("yieldEn"),
                    "water": r.get("wEn"),
                }
                for r in regions[:10]  # Limit to avoid token overflow
            ]
        }
        
        system_prompt = """You are an expert agricultural advisor specializing in rice cultivation in Egypt.
Analyze the satellite-derived field data and provide actionable insights.
Respond in JSON format as a list of insight objects with these fields:
- "type": "success" | "warning" | "error" | "info"
- "icon": an emoji
- "iEn": insight title in English
- "iAr": insight title in Arabic
- "rEn": recommendation in English
- "rAr": recommendation in Arabic (ترجمة عربية)
- "mEn": metric/impact in English
- "mAr": metric/impact in Arabic

Provide 3-5 insights. Focus on rice fields specifically."""

        user_prompt = f"""Analyze these agricultural fields and provide recommendations:

{json.dumps(summary, indent=2)}

Focus on:
1. Water management for rice fields (rice needs flooding)
2. Crop health based on NDVI values
3. Growth stage appropriateness
4. Yield expectations
5. Any stress indicators

Respond ONLY with valid JSON array."""

        response = _call_llm(user_prompt, system_prompt)
        insights = _parse_llm_response(response)
        
        # Ensure all required fields exist
        for ins in insights:
            ins.setdefault("type", "info")
            ins.setdefault("icon", "💡")
            ins.setdefault("iEn", "")
            ins.setdefault("iAr", "")
            ins.setdefault("rEn", "")
            ins.setdefault("rAr", "")
            ins.setdefault("mEn", "")
            ins.setdefault("mAr", "")
        
        logger.info(f"LLM generated {len(insights)} insights")
        return insights
        
    except Exception as e:
        logger.warning(f"LLM insights failed: {e}. Using rule-based fallback.")
        return _rule_based_insights(regions)


def generate_alerts(regions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates AI-powered alerts based on critical conditions.
    
    Uses LLM if available, otherwise falls back to rule-based alerts.
    """
    if not OPENAI_API_KEY and not GEMINI_API_KEY:
        return _rule_based_alerts(regions)
    
    try:
        critical_fields = [
            r for r in regions
            if r.get("ndvi", 0) < 0.2 or r.get("health", 100) < 50
        ]
        
        if not critical_fields:
            # No critical issues, still generate weather/forecast alerts
            summary = {"critical_fields": 0, "total_fields": len(regions)}
        else:
            summary = {
                "critical_fields": len(critical_fields),
                "total_fields": len(regions),
                "critical_details": [
                    {
                        "id": r.get("id"),
                        "crop": r.get("crop"),
                        "ndvi": r.get("ndvi"),
                        "ndwi": r.get("ndwi"),
                        "health": r.get("health"),
                    }
                    for r in critical_fields[:5]
                ]
            }
        
        system_prompt = """You are an agricultural alert system for rice cultivation in Egypt.
Generate alerts for critical field conditions.
Respond in JSON format as a list of alert objects with these fields:
- "sev": "critical" | "warning" | "info"
- "tEn": alert title in English
- "tAr": alert title in Arabic
- "dEn": description in English
- "dAr": description in Arabic
- "time": time context (e.g., "Just now", "1h", "24h")

Provide 1-3 alerts. Focus on real threats to crop health."""

        user_prompt = f"""Generate alerts for these field conditions:

{json.dumps(summary, indent=2)}

Respond ONLY with valid JSON array."""

        response = _call_llm(user_prompt, system_prompt)
        
        # Parse response
        text = response.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text
            text = text.rsplit("```", 1)[0]
        
        alerts = json.loads(text)
        if not isinstance(alerts, list):
            alerts = [alerts]
        
        for alert in alerts:
            alert.setdefault("sev", "info")
            alert.setdefault("tEn", "")
            alert.setdefault("tAr", "")
            alert.setdefault("dEn", "")
            alert.setdefault("dAr", "")
            alert.setdefault("time", "Just now")
        
        logger.info(f"LLM generated {len(alerts)} alerts")
        return alerts
        
    except Exception as e:
        logger.warning(f"LLM alerts failed: {e}. Using rule-based fallback.")
        return _rule_based_alerts(regions)


# ─── Rule-based fallbacks (original logic) ───

def _rule_based_insights(regions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Original rule-based insights (fallback when no LLM available)."""
    insights = []
    
    rice_fields = [r for r in regions if r.get("crop") == "Rice"]
    if rice_fields:
        stressed = [r for r in rice_fields if r.get("health", 100) < 75]
        if stressed:
            ids = [str(r["id"]) for r in stressed[:2]]
            insights.append({
                "type": "warning", "icon": "⚠️",
                "iEn": f"High water consumption with sub-optimal health — Rice fields #{', '.join(ids)}",
                "iAr": f"استهلاك مرتفع للمياه مع صحة أقل من المثالي — حقول الأرز #{', '.join(ids)}",
                "rEn": "Apply Alternate Wetting & Drying (AWD). Reduces water use 30–40% with zero yield impact.",
                "rAr": "طبق الري بالتبديل والتجفيف (AWD). يقلل استهلاك المياه 30–40% بدون تأثير على المحصول.",
                "mEn": "Saves ~550,000 m³ per season", "mAr": "يوفر ~550,000 م³ لكل موسم",
            })
        
        ready = [r for r in rice_fields if r.get("health", 0) > 80 and r.get("ndvi", 0) > 0.7]
        if ready:
            ids = [str(r["id"]) for r in ready[:2]]
            insights.append({
                "type": "success", "icon": "🌾",
                "iEn": f"Optimal harvest window — Rice fields #{', '.join(ids)}",
                "iAr": f"نافذة الحصاد المثالية — حقول الأرز #{', '.join(ids)}",
                "rEn": "NDVI at peak maturity. Harvest within 14–18 days for maximum grain quality.",
                "rAr": "NDVI في ذروة النضج. احصد خلال 14–18 يوم لأقصى جودة للحبوب.",
                "mEn": "Expected: 4.1–4.4 ton/feddan", "mAr": "المتوقع: 4.1–4.4 طن/فدان",
            })
    
    stressed_all = [r for r in regions if r.get("health", 100) < 65 and r.get("crop") != "Water"]
    if stressed_all:
        ins = stressed_all[0]
        insights.append({
            "type": "error", "icon": "🚨",
            "iEn": f"Crop stress detected — Field #{ins['id']}",
            "iAr": f"اكتشاف إجهاد المحصول — حقل #{ins['id']}",
            "rEn": "NDVI is below seasonal average. Apply nitrogen (30 kg/feddan) and irrigate within 48h.",
            "rAr": "NDVI أقل من المتوسط الموسمي. أضف النيتروجين (30 كجم/فدان) وري خلال 48 ساعة.",
            "mEn": "Prevents ~20% yield loss", "mAr": "يمنع ~20% فقدان المحصول",
        })
    
    if len(insights) < 3 and len(regions) > 2:
        best = max(regions, key=lambda x: x.get("health", 0))
        insights.append({
            "type": "info", "icon": "✨",
            "iEn": f"Field #{best['id']} has highest land quality score",
            "iAr": f"الحقل #{best['id']} لديه أعلى نقاط جودة الأرض",
            "rEn": "Superior nitrogen retention & drainage. Expand cultivation here next season.",
            "rAr": "احتفاظ ممتاز بالنيتروجين والصرف. وسع الزراعة هنا الموسم القادم.",
            "mEn": "Projected +15% yield", "mAr": "المتوقع +15% محصول",
        })
    
    return insights


def _rule_based_alerts(regions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Original rule-based alerts (fallback when no LLM available)."""
    alerts = []
    
    very_low = [r for r in regions if r.get("ndvi", 0) > 0.2 and r.get("ndwi", 0) < -0.1]
    if very_low:
        ids = [str(r["id"]) for r in very_low[:2]]
        alerts.append({
            "sev": "critical",
            "tEn": f"Water Stress — Fields #{', '.join(ids)}",
            "tAr": f"إجهاد مائي — حقول #{', '.join(ids)}",
            "dEn": "Moisture significantly below threshold",
            "dAr": "الرطوبة أقل من الحد بشكل كبير",
            "time": "Just now",
        })
    
    alerts.append({
        "sev": "info",
        "tEn": "Rain forecast in 48h",
        "tAr": "توقعات أمطار خلال 48 ساعة",
        "dEn": "Delay irrigation schedules",
        "dAr": "تأجيل جداول الري",
        "time": "1h",
    })
    
    return alerts
