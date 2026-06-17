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
MODEL_RESEARCH   = "meta/llama-3.3-70b-instruct"        # Stage 1
MODEL_STRATEGY   = "meta/llama-3.3-70b-instruct"  # Stage 1.5
MODEL_SYLLABUS   = "meta/llama-3.3-70b-instruct"        # Stage 2
MODEL_CONTENT    = "moonshotai/kimi-k2.6"                  # Stage 3
MODEL_SEARCH     = "perplexity/llama-3.1-sonar-large-128k-online"

class WorkshopRequest(BaseModel):
    topic: str
    audience: str
    customization: Optional[Dict[str, Any]] = None

class Stage1Request(BaseModel):
    topic: str
    audience: str
    customization: Optional[Dict[str, Any]] = None

class Stage15Request(BaseModel):
    topic: str
    audience: str
    stage1: Dict[str, Any]
    customization: Optional[Dict[str, Any]] = None

class Stage2Request(BaseModel):
    topic: str
    audience: str
    stage1: Dict[str, Any]
    interpreted_topic: str
    customization: Optional[Dict[str, Any]] = None

class Stage3Request(BaseModel):
    topic: str
    audience: str
    stage1: Dict[str, Any]
    stage2: Dict[str, Any]
    differentiation_angles: list
    interpreted_topic: str
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
        for item in data:
            if isinstance(item, dict) and key in item:
                val = item.get(key)
                if isinstance(val, list):
                    return val
        return data
    return []

def search_market_data(topic: str, audience: str) -> str:
    try:
        res = client.chat.completions.create(
            model=MODEL_SEARCH,
            messages=[
                {
                    "role": "user",
                    "content": f"חפש מידע עדכני על שוק ההדרכות בישראל בנושא: {topic}\nקהל יעד: {audience}\nאני רוצה: מחירים עדכניים, מתחרים פעילים, ביקוש, פערים בשוק.\nהחזר עובדות ספציפיות עם מקורות."
                }
            ],
            temperature=0.1
        )
        return res.choices[0].message.content or ""
    except Exception as e:
        print("Search market data failed:", e)
        return ""

def execute_stage1(topic: str, audience: str) -> Dict[str, Any]:
    search_results = search_market_data(topic, audience)
    
    sys1 = """אתה אסטרטג שיווקי ומומחה לפיתוח עסקי בשוק ההדרכות וסדנאות בישראל.
אתה עובד עם אביהו סיטון — פסיכותרפיסט עם רקע ייחודי:
- מהנדס בוגר הטכניון בהצטיינות
- ניהל פרויקטי ביצוע ברכבת ישראל — תשתיות, מאות מיליוני ש"ח, ניהול אנשים בשטח תחת לחץ
- מפקד לוחם פעיל במילואים — מכיר את הפסיכולוגיה של לחץ, אחריות וחזרה הביתה
- פסיכותרפיסט — עצמאות רגשית, שיטת "דרך", עובד עם מילואימניקים, זוגות, מנהלים
- הייחוד האנושי: "בן אדם רגיל" — ישיר, לא קליני, מגיע מהשטח לא מהאקדמיה

כשמקבלים בקשה לסדנה: אל תצטט את הנושא. נתח מה הכאב הרגשי האמיתי שעומד מאחוריו.
שאל את עצמך: היכן הכאב האנושי של הקהל הזה פוגש את האחריות המקצועית שלו?
רק אחרי שזיהית את הכאב — נתח את השוק.
החזר JSON בלבד, ללא טקסט נוסף."""
    
    user1 = f'''נושא שהוצע: "{topic}"
קהל יעד: "{audience}"

שלב א — פרש את הכוונה: מה הכאב הרגשי האמיתי של הקהל הזה? אל תצטט את הנושא — נתח אותו לעומק.
שלב ב — ניתוח שוק ישראלי: מה קיים היום? מה גנרי? היכן יש ביקוש שלא מקבל מענה ייחודי?
שלב ג — 3 נקודות כאב ספציפיות (לא "לחץ בעבודה" — ספציפי לקהל הזה ולרגע הזה בחייהם).

החזר JSON עם:
- interpreted_topic: הנושא המפורש (משפט אחד ממוקד — לא ציטוט)
- pain_points: מערך 3 פריטים ספציפיים לקהל
- objections: מערך 3 התנגדויות מכירה אמיתיות
- hooks: מערך 3 הוקים שיווקיים חדים
- market_gap: משפט אחד — הפער שאביהו יכול למלא שמהנדס-מפקד-מטפל יכול למלא ואף מרצה אחר לא'''
    
    if search_results:
        user1 = f"{user1}\n\nנתוני שוק עדכניים מהאינטרנט:\n{search_results}"
        
    res1 = client.chat.completions.create(
        model=MODEL_RESEARCH,
        messages=[
            {"role": "system", "content": sys1},
            {"role": "user", "content": user1}
        ],
        temperature=0.3
    )
    return extract_json(res1.choices[0].message.content)

def execute_stage15(topic: str, audience: str, stage1_json: Dict[str, Any]) -> Dict[str, Any]:
    interpreted_topic = stage1_json.get("interpreted_topic", topic)
    
    sys15 = """אתה יועץ מיצוב אסטרטגי בכיר. תפקידך: לזהות בידול שלא ניתן להעתיק.

פרופיל אביהו סיטון — קרא בעיון:
- מהנדס טכניון + ניהל תשתיות רכבת (לא יועץ ארגוני — מנהל שטח עם תקציב אמיתי ואנשים אמיתיים)
- מפקד מילואים לוחם — יודע מה קורה לאדם כשחוזר מ-60 יום מילואים למשפחה ולעבודה
- פסיכותרפיסט — לא מדבר בשפה קלינית, מדבר בשפת האדם שמכיר את השטח
- שיטת "דרך": נקודת הבחירה, נהר החיים, עצמאות רגשית

בידול אמיתי = משפט שאביהו יכול לומר על הבמה ושאף מרצה אחר בישראל לא יכול לומר באמינות.
לא "ניסיון עשיר" — ספציפי: "ניהלתי 200 עובדים בפרויקט תשתיות תחת לחץ, ואז הבנתי שהלחץ האמיתי לא היה בפרויקט"
החזר JSON בלבד, ללא טקסט נוסף."""

    user15 = f'''נושא: "{interpreted_topic}" | קהל: "{audience}"
ניתוח שוק: {json.dumps(stage1_json, ensure_ascii=False)}

צור 3 זוויות בידול אמיתיות לאביהו. לכל זווית:
- title: שם הזווית (קצר)
- description: הסבר (2 משפטים)
- isWinner: true/false (רק אחת true)
- why_avihu_only: חייב לנקוב ב-2 עובדות קונקרטיות מהרקע של אביהו ולחבר אותן לנושא. דוגמה: "ניהל פרויקטים בתשתיות תחת לחץ ואז עבר לטפל במנהלים — הוא חי את שני הצדדים". לא ביטויים גנריים.
- positioningStatement: משפט מיצוב חד שאפשר לשים בדף נחיתה

החזר JSON עם מפתח: differentiation_angles (מערך 3 פריטים)'''

    res15 = client.chat.completions.create(
        model=MODEL_STRATEGY,
        messages=[
            {"role": "system", "content": sys15},
            {"role": "user", "content": user15}
        ],
        temperature=0.4
    )
    stage15_json = extract_json(res15.choices[0].message.content)
    differentiation_angles = stage15_json.get("differentiation_angles", [])
    
    for idx, angle in enumerate(differentiation_angles):
        angle["id"] = idx + 1
        angle["defensibility"] = angle.pop("why_avihu_only", "")
        angle["economicPotential"] = "High" if angle.get("isWinner") else "Medium"

    if not isinstance(differentiation_angles, list) or len(differentiation_angles) == 0:
        differentiation_angles = [
            {
                "id": 1,
                "title": "דרך אל עצמאות רגשית",
                "description": f"חיבור הנושא של \"{interpreted_topic}\" לתפיסת נהר החיים - ללמד אנשים להשתמש בכלים של 'שיטת דרך' כדי להיות המטפלים של עצמם.",
                "isWinner": True,
                "economicPotential": "High",
                "defensibility": "ניהל פרויקטים בתשתיות תחת לחץ ואז עבר לטפל במנהלים — הוא חי את שני הצדדים.",
                "positioningStatement": f"הסדנה היחידה לנושא \"{interpreted_topic}\" שמפסיקה לתת 'טיפים' ומתחילה ללמד אותך להיות המטפל של עצמך דרך חיבור בין גוף, נפש ורוח."
            },
            {
                "id": 2,
                "title": "ממשבר למנוע צמיחה",
                "description": "התמקדות בקושי כמקור לצמיחה. שינוי פרספקטיבה על תסמינים כניסיון של הנפש להגיע לאיזון.",
                "isWinner": False,
                "economicPotential": "Medium",
                "defensibility": "מפקד לוחם במילואים המשלב ניסיון פיקודי עם טיפול מעשי במשברים בשטח.",
                "positioningStatement": f"להפוך את הקושי סביב \"{interpreted_topic}\" למנוף לצמיחה אישית, בגובה העיניים ובמרחב בטוח."
            },
            {
                "id": 3,
                "title": "חיבור זוגי ומשפחתי מתוך משבר",
                "description": "זווית המותאמת ספציפית למילואימניקים או זוגות - איך הנושא משפיע על התא המשפחתי.",
                "isWinner": False,
                "economicPotential": "Medium",
                "defensibility": "עובד עם ויצו ומילואימניקים ומשלב ניסיון אישי של חזרה הביתה לאחר שירות קרבי.",
                "positioningStatement": f"עיבוד וחזרה לשגרה: התמודדות עם \"{interpreted_topic}\" מתוך אחדות ועצמאות בקשר הזוגי."
            }
        ]
        
    return {"differentiation_angles": differentiation_angles}

def execute_stage2(topic: str, audience: str, stage1_json: Dict[str, Any], interpreted_topic: str) -> Dict[str, Any]:
    brand_voice, strengths, target_audience, methodology = load_all_constants()
    methodology_context = f"שיטת {methodology.get('name')}:\n- מטאפורה: {methodology.get('coreMetaphor')}\n- עקרונות:\n" + "\n".join(f"- {p}" for p in methodology.get('principles', [])) + "\n- כלים:\n" + "\n".join(f"- {c}" for c in methodology.get('toolsAndConcepts', []))
    
    sys2 = f"""אתה פדגוג מומחה בבניית סדנאות פרונטליות בישראל.
אתה בונה תכנית עבור אביהו סיטון המשתמש בשיטת "דרך": נקודת הבחירה, שלושת הכוחות, לעבור דרך כאב.
הטון: חם, ישיר, לא אקדמי. ללא ז'רגון קליני.
החזר JSON בלבד, ללא טקסט נוסף.

פרטי רקע על שיטת העבודה:
{methodology_context}"""
    
    user2 = f'בנה סילבוס לסדנה בת 3 שעות בנושא "{interpreted_topic}" (נושא מקורי: "{topic}") לקהל "{audience}". השתמש בתובנות: {json.dumps(stage1_json, ensure_ascii=False)}. החזר JSON עם: title, tagline, chapters (מערך 4 פרקים — כל פרק: title, duration_minutes, goal, key_points כמערך 3 פריטים, exercise).'
    
    res2 = client.chat.completions.create(
        model=MODEL_SYLLABUS,
        messages=[
            {"role": "system", "content": sys2},
            {"role": "user", "content": user2}
        ],
        temperature=0.5
    )
    return extract_json(res2.choices[0].message.content)

def execute_stage3(topic: str, audience: str, stage1_json: Dict[str, Any], stage2_json: Dict[str, Any], differentiation_angles: list, interpreted_topic: str) -> Dict[str, Any]:
    brand_voice, strengths, target_audience, methodology = load_all_constants()
    brand_context = f"ערכי המותג:\n- טון: {brand_voice.get('tone')}\n- סגנון: {brand_voice.get('uniqueStyle')}\n- ערכים: {', '.join(brand_voice.get('values', []))}\nחוזקות:\n" + "\n".join(f"- {s}" for s in strengths) + "\nקהל יעד:\n" + "\n".join(f"- {t}" for t in target_audience)
    
    sys3 = f"""אתה מומחה לבניית סדנאות פרונטליות — לא קופירייטר. אתה יוצר חומרי הנחיה אמיתיים.
אתה בונה עבור אביהו סיטון.

פרופיל אביהו (חייב להופיע בשקף הפתיחה):
- מהנדס טכניון + ניהל פרויקטי ביצוע ברכבת ישראל (200+ עובדים, מאות מיליוני ש"ח)
- מפקד לוחם במילואים — מכיר מה זה לחזור הביתה אחרי 60 יום
- פסיכותרפיסט שמדבר בגובה העיניים, לא בז'רגון קליני
- שיטת "דרך": נקודת הבחירה, נהר החיים

מבנה חובה — בדיוק 8 שקפים:
1. פתיחה: מי אביהו + שאלה אחת שפותחת מרחב ("מי מכם...?")
2. הכאב: תיאור מציאות שהם חיים — לא תאוריה, משפטים שמרגישים "זה אני"
3. הכאב מעמיק: מה זה עולה להם — בזוגיות, בעבודה, בתוך עצמם
4. הכלי א — נהר החיים: מה זה אומר לנושא הספציפי הזה
5. הכלי ב — נקודת הבחירה: איך מזהים אותה ברגע האמיתי
6. תרגיל: הוראות עשה ברורות ("כתוב", "שתף", "זהה") — לא תיאור של תרגיל
7. תובנה מהשטח: סיפור קצר או ציטוט מניסיון אביהו הממחיש את הכלי
8. סגירה: משפט אחד לקחת הביתה + פעולה אחת לשבוע הקרוב

כללי ברזל:
- כל שקף: 2-3 משפטים אנושיים — לא bullet list יבש
- שקף 1 חייב: "מהנדס + מנהל + לוחם + מטפל — זה הבסיס לאמינות שלי"
- שקף התרגיל: הוראות ישירות בגוף שני ("כתוב X", "שתף עם השכן שלך Y")
- טון: חם, ישיר, גובה עיניים. אסור ז'רגון פסיכולוגי.
החזר JSON בלבד, ללא טקסט נוסף.

{brand_context}"""

    user3 = f"""בנה חומרי סדנה מלאים בהתבסס על:
סילבוס: {json.dumps(stage2_json, ensure_ascii=False)}
נושא: "{interpreted_topic}" | קהל: "{audience}"
נקודות כאב: {json.dumps(safe_get_list(stage1_json, 'pain_points'), ensure_ascii=False)}
בידול מנצח: {json.dumps(next((a for a in differentiation_angles if a.get('isWinner')), {}), ensure_ascii=False)}

החזר JSON עם:
slides: מערך של 8 שקפים בדיוק — כל שקף:
  - slide_number: מספר (1-8)
  - slide_type: "opening" / "pain" / "tool" / "exercise" / "insight" / "closing"
  - title: כותרת השקף
  - bullets: מערך של 2-3 משפטים אנושיים (לא bullet list יבש)
  - facilitator_note: הערה קצרה למנחה — מה לומר או לשאול (משפט אחד)
  - image_prompt: תיאור תמונה באנגלית"""

    res3 = client.chat.completions.create(
        model=MODEL_CONTENT,
        messages=[
            {"role": "system", "content": sys3},
            {"role": "user", "content": user3}
        ],
        temperature=0.7
    )
    stage3_json = extract_json(res3.choices[0].message.content)
    return {"slides": safe_get_list(stage3_json, "slides")}

@app.post("/api/stage1")
async def run_stage1(request: Stage1Request):
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY not set in environment")
    try:
        return execute_stage1(request.topic, request.audience)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stage15")
async def run_stage15(request: Stage15Request):
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY not set in environment")
    try:
        return execute_stage15(request.topic, request.audience, request.stage1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stage2")
async def run_stage2(request: Stage2Request):
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY not set in environment")
    try:
        return execute_stage2(request.topic, request.audience, request.stage1, request.interpreted_topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stage3")
async def run_stage3(request: Stage3Request):
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY not set in environment")
    try:
        return execute_stage3(request.topic, request.audience, request.stage1, request.stage2, request.differentiation_angles, request.interpreted_topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_workshop(request: WorkshopRequest):
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY not set in environment")
    
    try:
        stage1 = execute_stage1(request.topic, request.audience)
        interpreted_topic = stage1.get("interpreted_topic", request.topic)
        
        stage15 = execute_stage15(request.topic, request.audience, stage1)
        differentiation_angles = stage15.get("differentiation_angles", [])
        
        stage2 = execute_stage2(request.topic, request.audience, stage1, interpreted_topic)
        stage3 = execute_stage3(request.topic, request.audience, stage1, stage2, differentiation_angles, interpreted_topic)
        
        # Build legacy format
        pains_str = ", ".join(safe_get_list(stage1, "pain_points"))
        objs_str = ", ".join(safe_get_list(stage1, "objections"))
        
        landscape = f"ניתוח שוק עבור סדנת \"{interpreted_topic}\" לקהל היעד \"{request.audience}\" מראה כי נקודות הכאב המרכזיות הן: {pains_str}. המשתתפים מביעים חששות והתנגדויות בעיקר סביב: {objs_str}."
        gaps = stage1.get("market_gap", "חסר חיבור אמיתי בין ידע תיאורטי לעבודה רגשית עמוקה שיורדת לחיי היומיום. רוב התכנים נשארים ברמת התיאוריה.")
        pricing = "150-300 ש״ח למשתתף, 3000-5000 ש״ח לארגון (מפגש חד פעמי)"
        
        market_research_payload = {
            "landscape": landscape,
            "formats": ["הרצאות זום בנות שעה", "סדנאות יום למנהלים", "קורסים דיגיטליים"],
            "pricing": pricing,
            "gaps": gaps
        }
        
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
        
        return {
            "topic": request.topic,
            "interpreted_topic": interpreted_topic,
            "market_gap": stage1.get("market_gap", ""),
            "marketResearch": market_research_payload,
            "differentiationAngles": differentiation_angles,
            "economicValidation": economic_validation,
            "syllabus": stage2,
            "slides": stage3.get("slides", []),
            "stage1_raw": stage1
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
