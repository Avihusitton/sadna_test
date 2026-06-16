<USER_REQUEST>

AGENTS RULES — SADNA_TEST (Antigravity / AI Agent Environment)
מסמך זה מגדיר את כללי העבודה, ארכיטקטורת הפרויקט, ונוהלי ה-Agent לריפו sadna_test.
הוא בנוי על בסיס לקחי הפרויקט therapy_new (ריפו עבר).

1. Identity & Execution Rule
אתה "Worker Agent" (Execution Node).

אתה לא ממציא ארכיטקטורה — אתה מבצע שינויים כירורגיים ממוקדים בהתאם להוראות.

לפני כל שינוי — קרא את ARCHITECTURE.md (כשייווצר) ואת מסמך זה.

Stack של הפרויקט: React 19 + Vite + React Router v7 + Zustand + Tailwind CSS v4 + Vitest.

2. Git Safety (חובה)
לעולם לא לעבוד ישירות על main.

ברנץ' ברירת המחדל לעבודה: dev (או stage — יש להגדיר בהתאם לבחירת הבעלים).

Push ל-main — רק אחרי אישור מפורש וכתוב מהבעלים.

אם אתה נמצא על main — עצור, עבור ל-dev/stage מיד.

3. Golden Workflow (חובה על כל משימה)
בצע בסדר הזה — ללא דילוגים:

Classify — זהה קטגוריה: A, B, או C (ראה §5).

Audit — קרא רק את הקבצים הרלוונטיים לקטגוריה. לא לסרוק את כל הפרויקט.

Diagnose — הסבר את שורש הבעיה/המשימה בבירור.

Fix — בצע את השינוי הקטן והבטוח ביותר. משימה אחת = קובץ אחד.

Validate — הוכח שהתיקון עובד (ראה §6 — Output Contract).

❌ אין לסרוק את כל הפרויקט בתחילת כל משימה — נווט ישירות לפי הקטגוריה.

4. Surgical Editing Protocol
אתר את השורה/ות המדויקות הנדרשות.

החלף רק את הקוד המבוקש — אל תגע בשאר.

אל תשנה לוגיקה עסקית בזמן תיקון UI, ולהפך.

שמור על RTL (dir="rtl") ועל שפת ממשק עברית — אל תשבור.

5. The 3-Category Navigation System
בכל משימה — זהה קטגוריה ראשונה, ואז נווט ישירות לתיקיות הרלוונטיות.

כל קובץ קוד חדש שנוצר חייב לכלול בשורה הראשונה הערה עם הקטגוריה:

// [Category A: UI / Design / Layout]

// [Category B: Functional / Logic]

// [Category C: Build / Config / Infra]

Category A: UI / Design / Layout
מיקום: src/views/, src/components/, src/App.css, src/index.css, public/

מטרה: מראה האפליקציה, רכיבי React, Tailwind classes, אנימציות, RTL.

כללים:

התמקד אך ורק ב-Tailwind classes ורכיבי UI.

אל תשנה לוגיקה עסקית, store, או שירותים.

שמור על RTL ועל שפה עברית בכל הממשק.

Tailwind v4 — אין tailwind.config.js, הכל מוגדר דרך CSS @theme ישירות.

Category B: Functional / Logic
מיקום: src/store/, src/services/, src/utils/, src/constants/

מטרה: State management (Zustand), לוגיקה עסקית, שירותי API, utility functions.

כללים:

זהה את הפער בין ההתנהגות הנוכחית לצפויה לפני כל שינוי.

שנה רק את הלוגיקה השבורה — minimal changes.

useStore הוא ה-single source of truth — אל תנהל state מקומי כשיש state גלובלי רלוונטי.

Store מכיל: topic, history, status (idle/generating/done/error), currentTask, marketAnalysis, materials (per-type status), theme, customization.

Category C: Build / Config / Infra
מיקום: vite.config.js, vitest.setup.js, eslint.config.js, package.json, index.html

מטרה: Vite config, Vitest, ESLint, dependencies.

כללים:

לפני שינוי גרסאות — עצור ושאל את הבעלים.

וודא תאימות בין: react@19, react-router-dom@7, vite@8, vitest@4, tailwindcss@4.

הפרויקט רץ ב-Client Side בלבד (SPA) — אין SSR, אין Edge runtime, אין window guards נדרשים.

basename="/sadna_test" מוגדר ב-Router — אל תשנה בלי להבין את השפעת ה-deployment.

6. Testing & QA Rules
הפרויקט משתמש ב-Vitest + @testing-library/react.

היכן נמצאים הטסטים
טסטים של Store: src/store/index.test.js (naming: *.test.js)

טסטים של Views/Components: src/views/*.spec.jsx (naming: *.spec.jsx)

Setup: vitest.setup.js ו-src/setupTests.js

כללי כתיבת טסטים
לכל פיצ'ר חדש — חייב להיות טסט.

Store tests (*.test.js):

js
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './index.js';

describe('useStore — [feature name]', () => {
  const initialState = useStore.getState();
  beforeEach(() => {
    useStore.setState(initialState, true); // reset state before each test
  });

  it('should [expected behavior]', () => {
    // Arrange
    // Act
    // Assert
  });
});
Component/View tests (*.spec.jsx):

jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ComponentName from './ComponentName';

// Mock useStore אם הקומפוננטה תלויה ב-store
vi.mock('../store', () => ({
  useStore: vi.fn()
}));

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // הגדר mock state ספציפי לכל תרחיש
  });

  it('should render [element] when [condition]', () => {
    render(<MemoryRouter><ComponentName /></MemoryRouter>);
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
מה לטסט
רמה	מה נבדק	כלי
Store	כל action, initial state, state transitions	Vitest + zustand getState/setState
View	Render תקין, תגובה לאירועי משתמש, states שונים (idle/loading/error)	Testing Library
Utils	פונקציות טהורות — input/output	Vitest
Service	Mock לקריאות API, success/error flows	vi.mock + vi.fn
מה לא לטסט
אל תטסט Tailwind classes.

אל תטסט implementation details פנימיים.

אל תטסט ספריות חיצוניות (zustand, react-router וכו').

7. Output Contract (חובה בסוף כל שינוי)
בסוף כל שינוי בקובץ, דווח בפורמט הזה בדיוק:

text
- Category Identified: [A / B / C]
- File Edited: [path/to/file]
- Root Cause / Reason: [הסבר קצר]
- Tests Added/Updated: [path/to/test.file or "none — no logic change"]
- Status: [Done / Needs verification]
אם פקודת Terminal נכשלת — ספק את הודעת השגיאה המדויקת.

8. Version Lock (קריטי — אל תדרוס)
חבילה	גרסה	סיבה
react + react-dom	^19.2.6	React 19 required
react-router-dom	^7.15.1	v7 API (Routes/Route)
vite	^8.0.12	תואם לכל stack
tailwindcss	^4.3.0	v4 — ללא config file
zustand	^5.0.13	v5 API
vitest	^4.1.8	תואם לvite@8
❌ אל תשדרג/תוריד גרסאות אלו — תיאום עם הבעלים חובה לפני כל שינוי ב-dependencies.

9. Architecture Quick Reference
text
sadna_test/
├── index.html               # Entry point
├── vite.config.js           # Build tool config
├── vitest.setup.js          # Test setup
├── src/
│   ├── main.jsx             # React DOM render
│   ├── App.jsx              # Router + layout + theme toggle
│   ├── store/
│   │   ├── index.js         # Zustand store (single source of truth)
│   │   └── index.test.js    # Store unit tests
│   ├── views/               # Page-level components (routed)
│   │   ├── TopicInput.jsx
│   │   ├── MarketAnalysis.jsx
│   │   ├── MarketAnalysis.spec.jsx
│   │   ├── GeneratedMaterials.jsx
│   │   └── WorkshopCustomizer.jsx
│   ├── components/          # Reusable UI components
│   ├── services/            # API calls / external integrations
│   ├── constants/           # Static data, enums, config values
│   ├── utils/               # Pure utility functions
│   └── assets/              # Static assets
Flow של האפליקציה
text
TopicInput → /analysis (MarketAnalysis) → /materials (GeneratedMaterials) → /customize (WorkshopCustomizer)
State Flow
text
useStore (Zustand) ← כל View קורא ישירות
status: idle → generating → done / error
10. Branch & Deploy Policy
Branch	מטרה
dev / stage	כל עבודה שוטפת
main	Production — רק אחרי אישור מפורש
כל שינוי — קטן או גדול — הולך קודם ל-dev/stage.

אין push ישיר ל-main — גם לא לתיקון typo.

11. כללים נוספים לעבודה יומיומית
לפני הוספת ספרייה חדשה — עצור ושאל את הבעלים.

RTL חובה — dir="rtl" על ה-root, כל ממשק בעברית.

אין state מקומי מיותר — אם המידע צריך לשרוד navigation, הוא שייך ל-useStore.

Services = pure functions — ללא side effects מחוץ לקריאת ה-API עצמה.

Constants — כל ערך קבוע (אפשרויות dropdown, enums, URLs) חייב להיות ב-src/constants/, לא hardcoded בתוך component.

טסט לכל פיצ'ר — אם נוספה לוגיקה ב-store או ב-service, חייב להיות טסט לצידה.

12. הסימן לבעיה — Diagnostic Checklist
סימפטום	בדוק
Route לא עובד	basename="/sadna_test" ב-BrowserRouter, ו-vite.config.js → base
Tailwind classes לא מסטייל	Tailwind v4 — ודא @import "tailwindcss" ב-CSS, לא config file
Store לא מתעדכן	ודא שמשתמשים ב-useStore ולא ביצירת instance חדש
טסט נכשל עם state ישן	ודא beforeEach(() => useStore.setState(initialState, true))
Mock לא עובד בטסט	ודא vi.mock('../store', ...) לפני ה-describe

</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-06-16T15:10:55+03:00.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from Gemini 3.5 Flash (High) to Gemini 3.1 Pro (Low). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>