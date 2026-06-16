import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI(title="Sadna Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "YOUR_API_KEY_HERE")
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY
)
MODEL_NAME = "meta/llama-3.1-70b-instruct"

class WorkshopRequest(BaseModel):
    topic: str
    audience: str

def generate_market_research(topic: str, audience: str) -> str:
    system_prompt = '''
    אתה אנליסט עסקי ואסטרטג שיווקי ברמת בכיר (CMO).
    תפקידך לנתח את השוק עבור סדנה חדשה.
    הפלט שלך חייב להיות מקצועי, מעמיק, מבוסס על פסיכולוגיית צרכנים, ולכלול:
    1. מהן 3 נקודות הכאב המרכזיות ביותר של הקהל הזה?
    2. מהן ההתנגדויות הנפוצות שלהם לקניית סדנאות או ייעוץ?
    3. אסטרטגיית שיווק: הצע 3 "הבטחות שיווקיות" (Hook) שיגרמו להם להירשם לסדנה הזו.
    כתוב בעברית רהוטה, עסקית וברורה.
    '''
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"נושא הסדנה: {topic}. קהל היעד: {audience}."}
        ],
        temperature=0.7,
        max_tokens=2048
    )
    return response.choices[0].message.content

def generate_syllabus(topic: str, audience: str, market_research: str) -> str:
    system_prompt = '''
    אתה פדגוג ומפתח הדרכה מומחה. אתה מתמחה בבניית סדנאות מעשיות (Workshop) שאינן רק תיאורטיות, אלא מבוססות על למידה אקטיבית.
    על בסיס מחקר השוק שתקבל, בנה סילבוס לסדנה של 3 שעות.
    המבנה חייב לכלול:
    1. חלוקה ל-4 פרקים עם לוחות זמנים.
    2. בכל פרק ציין מטרה פדגוגית ברורה.
    3. בכל פרק הגדר תרגיל מעשי אחד שהמשתתפים מבצעים בעצמם.
    כתוב בעברית ברורה, מקצועית ומובנית.
    '''
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"נושא הסדנה: {topic}\nקהל היעד: {audience}\n\nמחקר שוק לשימושך:\n{market_research}"}
        ],
        temperature=0.5,
        max_tokens=2048
    )
    return response.choices[0].message.content

def generate_presentation_materials(syllabus: str) -> str:
    system_prompt = '''
    אתה מעצב תוכן וקופירייטר שאחראי על בניית מצגות לסדנאות פרונטליות.
    המטרה שלך היא לקחת את הסילבוס ולהמיר אותו לראשי פרקים למצגת.
    עבור כל פרק בסילבוס, כתוב:
    1. כותרת לשקף פתיחה.
    2. 3-4 נקודות קצרות לשקף תוכן (Bullet points).
    3. תיאור קצר באנגלית (Prompt) של תמונה שכדאי לשים בשקף הזה כדי ליצור עניין ויזואלי.
    אל תכתוב פסקאות ארוכות, מצגת צריכה להיות מתומצתת.
    '''
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"הנה הסילבוס:\n{syllabus}"}
        ],
        temperature=0.6,
        max_tokens=2048
    )
    return response.choices[0].message.content

@app.post("/api/generate")
async def generate_workshop(request: WorkshopRequest):
    try:
        market_research = generate_market_research(request.topic, request.audience)
        syllabus = generate_syllabus(request.topic, request.audience, market_research)
        presentation = generate_presentation_materials(syllabus)
        
        return {
            "status": "success",
            "data": {
                "market_research": market_research,
                "syllabus": syllabus,
                "presentation_materials": presentation
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
