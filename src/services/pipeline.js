import { BRAND_VOICE, STRENGTHS, TARGET_AUDIENCE } from '../constants/brand';

// This is a simulated pipeline since we don't have a specific LLM API key.
// In a real production environment, this would call an API like OpenAI to generate these based on prompts.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async (fn, retries = 1, delayMs = 2000) => {
  try {
    return await fn();
  } catch (error) {
    // Check if error is a specific intentional throw (like NO_DIFFERENTIATION)
    if (error.message === "NO_STRONG_DIFFERENTIATION" || retries === 0) {
      throw error;
    }
    console.warn(`Operation failed, retrying in ${delayMs}ms...`, error);
    await delay(delayMs);
    return await withRetry(fn, retries - 1, delayMs);
  }
};

export const runMarketAnalysisPipeline = async (topic, updateProgress) => {
  return withRetry(async () => {
    // Step 2A: Market Research
    updateProgress('2A - Market Research (Web Search simulation)...');
    await delay(1500); // Simulate network latency
    const marketResearch = {
      landscape: `השוק בישראל לנושא "${topic}" רווי ברובו בהרצאות פרונטליות כלליות. רוב הסדנאות מתמקדות בתיאוריה ולא בפרקטיקה אישית.`,
      formats: ["הרצאות זום בנות שעה", "סדנאות יום למנהלים", "קורסים דיגיטליים"],
      pricing: "150-300 ש״ח למשתתף, 3000-5000 ש״ח לארגון (מפגש חד פעמי)",
      gaps: "חסר חיבור אמיתי בין ידע תיאורטי לעבודה רגשית עמוקה שיורדת לחיי היומיום. רוב התכנים נשארים 'בשכל' ולא מחברים את 'הגוף והנפש'."
    };

    // Step 2B: Differentiation Analysis
    updateProgress('2B - Differentiation Analysis (Cross-referencing constants)...');
    await delay(1500);

    // Check for a real differentiation angle (simulated logic)
    const hasDifferentiation = topic.length > 3; // basic simulation rule

    if (!hasDifferentiation) {
      throw new Error("NO_STRONG_DIFFERENTIATION");
    }

    const differentiationAngles = [
      {
        id: 1,
        title: "דרך אל עצמאות רגשית",
        description: `חיבור הנושא של "${topic}" לתפיסת נהר החיים - ללמד אנשים להשתמש בכלים של 'שיטת דרך' כדי להיות המטפלים של עצמם.`,
        isWinner: true,
        economicPotential: "High",
        defensibility: "נשען על שפה ייחודית (שיטת דרך) ועל הניסיון הספציפי של אביהו בחיבור בין פרקטיקה, רוח ויהדות - קשה מאוד להעתקה.",
        positioningStatement: `הסדנה היחידה לנושא "${topic}" שמפסיקה לתת 'טיפים' ומתחילה ללמד אותך להיות המטפל של עצמך דרך חיבור בין גוף, נפש ורוח.`
      },
      {
        id: 2,
        title: "ממשבר למנוע צמיחה",
        description: "התמקדות בקושי כמקור לצמיחה. שינוי פרספקטיבה על תסמינים כניסיון של הנפש להגיע לאיזון.",
        isWinner: false,
        economicPotential: "Medium",
        defensibility: "גישה עמוקה הדורשת מיומנות הנחיה גבוהה שיש לאביהו.",
        positioningStatement: `להפוך את הקושי סביב "${topic}" למנוף לצמיחה אישית, בגובה העיניים ובמרחב בטוח.`
      },
      {
        id: 3,
        title: "חיבור זוגי ומשפחתי מתוך משבר",
        description: "זווית המותאמת ספציפית למילואימניקים או זוגות - איך הנושא משפיע על התא המשפחתי.",
        isWinner: false,
        economicPotential: "High - specific niche",
        defensibility: "נשען על החוזקות של אביהו בעבודה עם מילואימניקים וזוגות.",
        positioningStatement: `עיבוד וחזרה לשגרה: התמודדות עם "${topic}" מתוך אחדות ועצמאות בקשר הזוגי.`
      }
    ];

    // Step 2C: Economic Validation
    updateProgress('2C - Economic Validation...');
    await delay(1000);

    const economicValidation = {
      decision: "GO", // or NO-GO
      recommendedFormat: "half-day", // "keynote 2h", "half-day", "full-day", "2-day"
      justification: "נושא עמוק שדורש זמן לעיבוד, בניית אמון ותרגול מעשי של נקודת הבחירה.",
      estimatedPricePerParticipant: "350-500 ש״ח",
      estimatedPricePerGroup: "6,000-8,000 ש״ח",
      breakevenSize: 12
    };

    return {
      topic,
      marketResearch,
      differentiationAngles,
      economicValidation
    };
  }).catch((error) => {
    console.error("Pipeline Error:", error);
    if (error.message === "NO_STRONG_DIFFERENTIATION") {
       return { error: "NO_DIFFERENTIATION" };
    }
    return { error: "PIPELINE_FAILED", details: error.message };
  });
};