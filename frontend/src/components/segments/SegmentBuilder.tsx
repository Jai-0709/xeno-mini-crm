'use client';

import { useState } from 'react';
import { Plus, X, Users, Save } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';
import { AISegmentBuilder } from './AISegmentBuilder';
import { Sparkles } from 'lucide-react';

type FilterRule = { field: string; operator: string; value: string };

const FIELDS = [
  { value: 'totalSpend',      label: 'Total Spend (₹)' },
  { value: 'totalOrders',     label: 'Total Orders' },
  { value: 'avgOrderValue',   label: 'Avg Order Value (₹)' },
  { value: 'city',            label: 'City' },
  { value: 'tag',             label: 'Tag' },
  { value: 'lastPurchaseDate',label: 'Last Purchase (days ago)' },
];

const OPERATORS: Record<string, { value: string; label: string }[]> = {
  totalSpend:       [{ value:'gt', label:'>' },{ value:'gte', label:'≥' },{ value:'lt', label:'<' },{ value:'lte', label:'≤' },{ value:'eq', label:'=' }],
  totalOrders:      [{ value:'gt', label:'>' },{ value:'gte', label:'≥' },{ value:'lt', label:'<' },{ value:'lte', label:'≤' },{ value:'eq', label:'=' }],
  avgOrderValue:    [{ value:'gt', label:'>' },{ value:'gte', label:'≥' },{ value:'lt', label:'<' },{ value:'lte', label:'≤' },{ value:'eq', label:'=' }],
  city:             [{ value:'eq', label:'is' },{ value:'neq', label:'is not' }],
  tag:              [{ value:'eq', label:'is' },{ value:'neq', label:'is not' }],
  lastPurchaseDate: [{ value:'gt', label:'more than X days ago' },{ value:'lte', label:'within X days' }],
};

const TAG_VALUES = ['VIP','Regular','At-Risk','New','Loyal'];
const CITY_VALUES = ['Mumbai','Delhi','Bengaluru','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad','Jaipur','Surat'];

interface SegmentBuilderProps {
  onSaved: () => void;
}

export function SegmentBuilder({ onSaved }: SegmentBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [rules, setRules] = useState<FilterRule[]>([{ field: 'totalSpend', operator: 'gt', value: '' }]);
  const [preview, setPreview] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  function addRule() {
    setRules(r => [...r, { field: 'totalSpend', operator: 'gt', value: '' }]);
  }

  function removeRule(i: number) {
    setRules(r => r.filter((_, idx) => idx !== i));
  }

  function updateRule(i: number, key: keyof FilterRule, val: string) {
    setRules(r => r.map((rule, idx) => idx === i ? { ...rule, [key]: val, ...(key === 'field' ? { operator: OPERATORS[val]?.[0]?.value || 'eq', value: '' } : {}) } : rule));
  }

  async function previewCount() {
    setPreviewing(true);
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'preview', description: '', filters: rules, preview: true }),
    });
    const d = await res.json();
    setPreview(d.count ?? 0);
    setPreviewing(false);
  }

  async function save() {
    if (!name.trim()) { addToast({ type: 'error', title: 'Name required', message: 'Please enter a segment name' }); return; }
    if (rules.some(r => !r.value)) { addToast({ type: 'error', title: 'Incomplete rules', message: 'All filter rules must have a value' }); return; }
    setSaving(true);
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, filters: rules }),
    });
    if (res.ok) {
      addToast({ type: 'success', title: 'Segment saved!', message: `"${name}" is ready to use in campaigns` });
      setName(''); setDescription(''); setRules([{ field: 'totalSpend', operator: 'gt', value: '' }]); setPreview(null);
      onSaved();
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 rounded-lg" style={{ background: '#111111' }}>
        <button
          onClick={() => setAiMode(false)}
          className="flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{ background: !aiMode ? '#1f1f1f' : 'transparent', color: !aiMode ? '#f0f0f0' : '#6b7280' }}
        >
          Manual Builder
        </button>
        <button
          onClick={() => setAiMode(true)}
          className="flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{ background: aiMode ? '#1f1f1f' : 'transparent', color: aiMode ? '#f0f0f0' : '#6b7280' }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: aiMode ? '#7c5cbf' : undefined }} />
          AI Builder
        </button>
      </div>

      {aiMode ? (
        <AISegmentBuilder
          onRulesGenerated={(aiRules, aiName) => {
            setRules(aiRules);
            if (aiName) setName(aiName);
            setAiMode(false);
          }}
        />
      ) : (
        <>
          {/* Name & description */}
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Segment name (e.g. Mumbai High Spenders)"
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
              style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }}
            />
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
              style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }}
            />
          </div>

          {/* Logic toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm" style={{ color: '#6b7280' }}>Match</span>
            {(['AND','OR'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLogic(l)}
                className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
                style={{
                  background: logic === l ? 'rgba(79,110,247,0.12)' : 'transparent',
                  color: logic === l ? '#4f6ef7' : '#6b7280',
                  borderColor: logic === l ? '#4f6ef7' : '#1f1f1f',
                }}
              >
                {l}
              </button>
            ))}
            <span className="text-sm" style={{ color: '#6b7280' }}>of the following rules</span>
          </div>

          {/* Rules */}
          <div className="flex flex-col gap-3">
            {rules.map((rule, i) => {
              const ops = OPERATORS[rule.field] || [];
              const isEnum = rule.field === 'tag' || rule.field === 'city';
              const enumVals = rule.field === 'tag' ? TAG_VALUES : CITY_VALUES;
              return (
                <div key={i} className="flex flex-wrap md:flex-nowrap items-center gap-2">
                  <select
                    value={rule.field}
                    onChange={e => updateRule(i, 'field', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }}
                  >
                    {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <select
                    value={rule.operator}
                    onChange={e => updateRule(i, 'operator', e.target.value)}
                    className="px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0', minWidth: 80 }}
                  >
                    {ops.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {isEnum ? (
                    <select
                      value={rule.value}
                      onChange={e => updateRule(i, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }}
                    >
                      <option value="">Select...</option>
                      {enumVals.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={rule.value}
                      onChange={e => updateRule(i, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }}
                    />
                  )}
                  {rules.length > 1 && (
                    <button onClick={() => removeRule(i)} className="p-2 rounded-lg" style={{ color: '#3f3f46' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#3f3f46')}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
            <button onClick={addRule} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed text-sm transition-colors"
              style={{ borderColor: '#2a2a2a', color: '#6b7280' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#4f6ef7'; (e.currentTarget as HTMLButtonElement).style.color = '#4f6ef7'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'; (e.currentTarget as HTMLButtonElement).style.color = '#6b7280'; }}>
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>

          {/* Preview */}
          {preview !== null && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)' }}>
              <Users className="w-4 h-4" style={{ color: '#4f6ef7' }} />
              <span className="text-sm" style={{ color: '#f0f0f0' }}>
                This segment matches <span className="font-mono font-bold" style={{ color: '#4f6ef7' }}>{preview}</span> customers
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={previewCount} disabled={previewing}
              className="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{ borderColor: '#2a2a2a', color: '#6b7280' }}>
              <Users className="w-4 h-4" />
              {previewing ? 'Counting...' : 'Preview Count'}
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #4f6ef7, #7c5cbf)', color: '#fff' }}>
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Segment'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
