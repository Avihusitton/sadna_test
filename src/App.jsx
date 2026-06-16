import React, { useState } from 'react';

export default function WorkshopGenerator() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic || !audience) {
      setError('אנא מלא את נושא הסדנה ואת קהל היעד.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, audience }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || 'שגיאה ביצירת הסדנה');
      
      setResults(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#2563eb' }}>מחולל הסדנאות החכם</h1>
      
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>נושא הסדנה:</label>
          <input 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            placeholder="לדוגמה: אוטומציה לעסקים קטנים"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>קהל יעד:</label>
          <input 
            type="text" 
            value={audience} 
            onChange={(e) => setAudience(e.target.value)} 
            placeholder="לדוגמה: סוכני ביטוח"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '15px' }}>{error}</div>}

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          {loading ? 'מייצר מחקר שוק וסילבוס... (זה עשוי לקחת כדקה)' : 'צור סדנה עכשיו'}
        </button>
      </div>

      {results && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>תוצאות המחקר:</h2>
          
          <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h3 style={{ color: '#334155' }}>1. מחקר שוק ואסטרטגיה</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{results.market_research}</pre>
          </div>
          
          <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h3 style={{ color: '#334155' }}>2. סילבוס מפורט</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{results.syllabus}</pre>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h3 style={{ color: '#334155' }}>3. חומרים למצגת</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{results.presentation_materials}</pre>
          </div>
        </div>
      )}
    </div>
  );
}