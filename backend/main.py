import os
import re
import json
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Sadna Generator Production API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY")
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY or "DUMMY_KEY"
)
MODEL_NAME = "meta/llama-3.1-70b-instruct"

class WorkshopRequest(BaseModel):
    topic: str
    audience: str
    customization: Optional[Dict[str, Any]] = None

def load_all_constants():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, ".."))
    
    brand_file = os.path.join(root_dir, "src", "constants", "brand.js")
    methodology_file = os.path.join(root_dir, "src", "constants", "methodology.js")
    
    if not os.path.exists(brand_file):
        brand_file = os.path.join(script_dir, "brand.js")
    if not os.path.exists(methodology_file):
        methodology_file = os.path.join(script_dir, "methodology.js")
        
    with open(brand_file, "r", encoding="utf-8") as f:
        brand_content = f.read()
    with open(methodology_file, "r", encoding="utf-8") as f:
        meth_content = f.read()
        
    def parse_js_array(content, var_name):
        pattern = rf'export\s+const\s+{var_name}\s*=\s*\[(.*?)\];'
        match = re.search(pattern, content, re.DOTALL)
        if not match:
            return []
        items = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', match.group(1))
        return items

    def parse_js_object(content, var_name):
        pattern = rf'export\s+const\s+{var_name}\s*=\s*{{(.*?)}};'
        match = re.search(pattern, content, re.DOTALL)
        if not match:
            return {}
        obj_content = match.group(1)
        
        result = {}
        for m in re.finditer(r'(\w+):\s*"([^"\\]*(?:\\.[^"\\]*)*)"', obj_content):
            result[m.group(1)] = m.group(2)
        
        for m in re.finditer(r'(\w+):\s*\[(.*?)\]', obj_content, re.DOTALL):
            key = m.group(1)
            arr_str = m.group(2)
            items = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', arr_str)
            result[key] = items
            
        return result

    brand_voice = parse_js_object(brand_content, "BRAND_VOICE")
    strengths = parse_js_array(brand_content, "STRENGTHS")
    target_audience = parse_js_array(brand_content, "TARGET_AUDIENCE")
    methodology = parse_js_object(meth_content, "METHODOLOGY")
    
    return brand_voice, strengths, target_audience, methodology

def extract_json(text: str) -> dict:
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
            
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        try:
            return json.loads(text[start:end+1])
        except json.JSONDecodeError:
            pass
            
def safe_get_list(data: Any, key: str) -> list:
    if isinstance(data, dict):
        val = data.get(key, [])
        return val if isinstance(val, list) else []
    elif isinstance(data, list):
        # If it is a list of dicts, search for the key
        for item in data:
            if isinstance(item, dict) and key in item:
                val = item.get(key)
                if isinstance(val, list):
                    return val
        return data
    return []

@app.post("/api/generate")
async def generate_workshop(request: WorkshopRequest):
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY not set in environment")
    
    try:
        brand_voice, strengths, target_audience, methodology = load_all_constants()
        
        # Build context strings
        brand_context = f"ערכי המותג:\n- טון: {brand_voice.get('tone')}\n- סגנון: {brand_voice.get('uniqueStyle')}\n- ערכים: {', '.join(brand_voice.get('values', []))}\nחוזקות:\n" + "\n".join(f"- {s}" for s in strengths) + "\nקהל יעד:\n" + "\n".join(f"- {t}" for t in target_audience)
        methodology_context = f"שיטת {methodology.get('name')}:\n- מטאפורה: {methodology.get('coreMetaphor')}\n- עקרונות:\n" + "\n".join(f"- {p}" for p in methodology.get('principles', [])) + "\n- כלים:\n" + "\n".join(f"- {c}" for c in methodology.get('toolsAndConcepts', []))
        
        # Stage 1 — Market Research (CMO Persona), temperature: 0.3
        sys1 = f"""אתה CMO מנוסה עם 20 שנות ניסיון בשיווק סדנאות בישראל.
אתה עובד עם המטפל אביהו סיטון. המומחיות שלו: שיטת "דרך" — נהר החיים, עצמאות רגשית, עבודה עם מילואימניקים וזוגות.
ערכי המותג: חמימות, ישירות, כלים פרקטיים, חיבור גוף-נפש-רוח.
החזר JSON בלבד, ללא טקסט נוסף.

פרטי רקע על המותג:
{brand_context}"""
        
        user1 = f'נתח את השוק הישראלי עבור סדנה בנושא "{request.topic}" לקהל: "{request.audience}". החזר JSON עם המפתחות: pain_points (מערך 3 פריטים), objections (מערך 3 פריטים), hooks (מערך 3 פריטים).'
        
        res1 = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": sys1},
                {"role": "user", "content": user1}
            ],
            temperature=0.3
        )
        stage1_output = res1.choices[0].message.content
        stage1_json = extract_json(stage1_output)
        
        # Stage 2 — Syllabus (Pedagogue Persona), temperature: 0.5
        sys2 = f"""אתה פדגוג מומחה בבניית סדנאות פרונטליות בישראל.
אתה בונה תכנית עבור אביהו סיטון המשתמש בשיטת "דרך": נקודת הבחירה, שלושת הכוחות, לעבור דרך כאב.
הטון: חם, ישיר, לא אקדמי. ללא ז'רגון קליני.
החזר JSON בלבד, ללא טקסט נוסף.

פרטי רקע על שיטת העבודה:
{methodology_context}"""
        
        user2 = f'בנה סילבוס לסדנה בת 3 שעות בנושא "{request.topic}" לקהל "{request.audience}". השתמש בתובנות: {json.dumps(stage1_json, ensure_ascii=False)}. החזר JSON עם: title, tagline, chapters (מערך 4 פרקים — כל פרק: title, duration_minutes, goal, key_points כמערך 3 פריטים, exercise).'
        
        res2 = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": sys2},
                {"role": "user", "content": user2}
            ],
            temperature=0.5
        )
        stage2_output = res2.choices[0].message.content
        stage2_json = extract_json(stage2_output)
        
        # Stage 3 — Slide Materials (Copywriter Persona), temperature: 0.7
        sys3 = f"""אתה קופירייטר המתמחה במצגות לסדנאות.
אתה יוצר חומרים עבור אביהו סיטון. כל שקף: פשוט, עוצמתי, מושך רגשית.
כלל ברזל: ללא פסקאות ארוכות — bullet points קצרים בלבד.
החזר JSON בלבד, ללא טקסט נוסף.

פרטי רקע על המותג:
{brand_context}"""
        
        user3 = f'צור שקפים עבור: {json.dumps(stage2_json, ensure_ascii=False)}. החזר JSON עם: slides (מערך — כל שקף: slide_number, title, bullets כמערך 3 פריטים קצרים, image_prompt באנגלית).'
        
        res3 = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": sys3},
                {"role": "user", "content": user3}
            ],
            temperature=0.7
        )
        stage3_output = res3.choices[0].message.content
        stage3_json = extract_json(stage3_output)
        
        # Synthesize front-end marketResearch payload
        pains_str = ", ".join(safe_get_list(stage1_json, "pain_points"))
        objs_str = ", ".join(safe_get_list(stage1_json, "objections"))
        
        landscape = f"ניתוח שוק עבור סדנת \"{request.topic}\" לקהל היעד \"{request.audience}\" מראה כי נקודות הכאב המרכזיות הן: {pains_str}. המשתתפים מביעים חששות והתנגדויות בעיקר סביב: {objs_str}."
        gaps = "חסר חיבור אמיתי בין ידע תיאורטי לעבודה רגשית עמוקה שיורדת לחיי היומיום. רוב התכנים נשארים ברמת התיאוריה."
        pricing = "150-300 ש״ח למשתתף, 3000-5000 ש״ח לארגון (מפגש חד פעמי)"
        
        market_research_payload = {
            "landscape": landscape,
            "formats": ["הרצאות זום בנות שעה", "סדנאות יום למנהלים", "קורסים דיגיטליים"],
            "pricing": pricing,
            "gaps": gaps
        }
        
        # Construct differentiationAngles
        differentiation_angles = [
            {
                "id": 1,
                "title": "דרך אל עצמאות רגשית",
                "description": f"חיבור הנושא של \"{request.topic}\" לתפיסת נהר החיים - ללמד אנשים להשתמש בכלים של 'שיטת דרך' כדי להיות המטפלים של עצמם.",
                "isWinner": True,
                "economicPotential": "High",
                "defensibility": "נשען על שפה ייחודית (שיטת דרך) ועל הניסיון הספציפי של אביהו בחיבור בין פרקטיקה, רוח ויהדות - קשה מאוד להעתקה.",
                "positioningStatement": f"הסדנה היחידה לנושא \"{request.topic}\" שמפסיקה לתת 'טיפים' ומתחילה ללמד אותך להיות המטפל של עצמך דרך חיבור בין גוף, נפש ורוח. hooks מובילים: {', '.join(safe_get_list(stage1_json, 'hooks'))}"
            },
            {
                "id": 2,
                "title": "ממשבר למנוע צמיחה",
                "description": "התמקדות בקושי כמקור לצמיחה. שינוי פרספקטיבה על תסמינים כניסיון של הנפש להגיע לאיזון.",
                "isWinner": False,
                "economicPotential": "Medium",
                "defensibility": "גישה עמוקה הדורשת מיומנות הנחיה גבוהה שיש לאביהו.",
                "positioningStatement": f"להפוך את הקושי סביב \"{request.topic}\" למנוף לצמיחה אישית, בגובה העיניים ובמרחב בטוח."
            },
            {
                "id": 3,
                "title": "חיבור זוגי ומשפחתי מתוך משבר",
                "description": "זווית המותאמת ספציפית למילואימניקים או זוגות - איך הנושא משפיע על התא המשפחתי.",
                "isWinner": False,
                "economicPotential": "High - specific niche",
                "defensibility": "נשען על החוזקות של אביהו בעבודה עם מילואימניקים וזוגות.",
                "positioningStatement": f"עיבוד וחזרה לשגרה: התמודדות עם \"{request.topic}\" מתוך אחדות ועצמאות בקשר הזוגי."
            }
        ]
        
        # Construct economicValidation
        duration = request.customization.get("duration", "half-day") if request.customization else "half-day"
        duration_map = {
            "90-min": "90 דקות (הרצאה אקטיבית)",
            "half-day": "חצי יום (העמקה)",
            "full-day": "יום שלם (תהליך מלא)",
            "2-day": "יומיים (ריטריט/הכשרה)"
        }
        recommended_format = duration_map.get(duration, "חצי יום (העמקה)")
        
        economic_validation = {
            "decision": "GO",
            "recommendedFormat": recommended_format,
            "justification": "נושא עמוק שדורש זמן לעיבוד, בניית אמון ותרגול מעשי של נקודת הבחירה.",
            "estimatedPricePerParticipant": "350-500 ש״ח",
            "estimatedPricePerGroup": "6,000-8,000 ש״ח",
            "breakevenSize": 12
        }
        
        # Combine everything
        return {
            "topic": request.topic,
            "marketResearch": market_research_payload,
            "differentiationAngles": differentiation_angles,
            "economicValidation": economic_validation,
            "syllabus": stage2_json,
            "slides": safe_get_list(stage3_json, "slides"),
            "stage1_raw": stage1_json
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
