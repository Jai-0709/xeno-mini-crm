'use client';

import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

type FilterRule = { field: string; operator: string; value: string };

interface AISegmentBuilderProps {
  onRulesGenerated: (rules: FilterRule[], name?: string) => void;
}

const EXAMPLES = [
  'Customers in Mumbai who spent over ₹10,000',
  'VIP customers who haven\'t purchased in 60 days',
  'New customers with more than 2 orders',
  'High spenders from Bengaluru or Delhi',
];

export function AISegmentBuilder({ onRulesGenerated }: AISegmentBuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/ai/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.rules && Array.isArray(data.rules)) {
        onRulesGenerated(data.rules, data.name);
      } else {
        setError('Could not parse rules. Try being more specific.');
      }
    } catch {
      setError('AI request failed. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="p-4 rounded-xl border" style={{ background: 'rgba(124,92,191,0.06)', borderColor: 'rgba(124,92,191,0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" style={{ color: '#7c5cbf' }} />
          <span className="text-sm font-semibold" style={{ color: '#f0f0f0' }}>AI Segment Builder</span>
        </div>
        <p className="text-xs" style={{ color: '#6b7280' }}>
          Describe your target audience in plain English and the AI will generate the filter rules for you.
        </p>
      </div>

      {/* Examples */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium" style={{ color: '#6b7280' }}>Try an example:</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="px-3 py-1.5 rounded-lg border text-xs transition-all"
              style={{ borderColor: '#2a2a2a', color: '#6b7280' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#7c5cbf'; (e.currentTarget as HTMLButtonElement).style.color = '#f0f0f0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'; (e.currentTarget as HTMLButtonElement).style.color = '#6b7280'; }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); } }}
          placeholder="e.g. Customers in Delhi who spent over ₹5000 and are VIPs..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
          style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }}
        />
      </div>

      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        style={{
          background: loading || !prompt.trim() ? '#1a1a1a' : 'linear-gradient(135deg, #7c5cbf, #4f6ef7)',
          color: loading || !prompt.trim() ? '#3f3f46' : '#fff',
        }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating rules...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Filters
          </>
        )}
      </button>
    </div>
  );
}
