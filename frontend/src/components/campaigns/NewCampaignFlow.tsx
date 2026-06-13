'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Send, Calendar, CheckCircle } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

interface Segment { id: string; name: string; customerCount: number; }

const CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  { value: 'email',    label: 'Email',    color: '#4f6ef7' },
  { value: 'sms',      label: 'SMS',      color: '#f59e0b' },
  { value: 'rcs',      label: 'RCS',      color: '#7c5cbf' },
];

const STEPS = ['Basics', 'Message', 'Schedule', 'Review'];

interface NewCampaignFlowProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NewCampaignFlow({ open, onClose, onCreated }: NewCampaignFlowProps) {
  const [step, setStep] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [segmentId, setSegmentId] = useState('');
  const [message, setMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    if (open) {
      fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/segments').then(r => r.json()).then(setSegments);
    }
  }, [open]);

  async function generateMessage() {
    setAiLoading(true);
    const seg = segments.find(s => s.id === segmentId);
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/ai/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        campaignName: name,
        segmentName: seg?.name || 'all customers',
        tone: 'friendly',
      }),
    });
    const data = await res.json();
    if (data.message) setMessage(data.message);
    setAiLoading(false);
  }

  async function save() {
    setSaving(true);
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, channel, segmentId, message,
        scheduledAt: scheduledAt || null,
        status: scheduledAt ? 'scheduled' : 'draft',
      }),
    });
    if (res.ok) {
      addToast({ type: 'success', title: 'Campaign created!', message: `"${name}" saved as ${scheduledAt ? 'scheduled' : 'draft'}` });
      onCreated();
      handleClose();
    }
    setSaving(false);
  }

  function handleClose() {
    setStep(0); setName(''); setChannel('whatsapp'); setSegmentId('');
    setMessage(''); setScheduledAt(''); onClose();
  }

  const canNext = [
    name.trim() && segmentId,
    message.trim(),
    true,
    true,
  ][step];

  const selectedSeg = segments.find(s => s.id === segmentId);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} />

          <motion.div
            className="relative z-10 w-full rounded-2xl border overflow-hidden"
            style={{ maxWidth: 640, background: '#161616', borderColor: '#1f1f1f', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1f1f1f' }}>
              <div>
                <h2 className="font-semibold" style={{ color: '#f0f0f0' }}>New Campaign</h2>
                <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
              </div>
              <button onClick={handleClose} style={{ color: '#6b7280' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex px-6 pt-5 gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        background: i < step ? 'linear-gradient(135deg,#4f6ef7,#7c5cbf)' : i === step ? 'rgba(79,110,247,0.2)' : '#1a1a1a',
                        color: i <= step ? '#fff' : '#3f3f46',
                        border: i === step ? '1px solid #4f6ef7' : 'none',
                      }}>
                      {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className="text-xs hidden sm:block" style={{ color: i === step ? '#f0f0f0' : '#3f3f46' }}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ background: i < step ? '#4f6ef7' : '#1f1f1f' }} />}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="p-6 min-h-64">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

                  {/* Step 0: Basics */}
                  {step === 0 && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6b7280' }}>Campaign Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Diwali Flash Sale 2025"
                          className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                          style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }} />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6b7280' }}>Channel</label>
                        <div className="grid grid-cols-4 gap-2">
                          {CHANNELS.map(ch => (
                            <button key={ch.value} onClick={() => setChannel(ch.value)}
                              className="py-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-1"
                              style={{
                                background: channel === ch.value ? ch.color + '18' : '#111111',
                                borderColor: channel === ch.value ? ch.color : '#1f1f1f',
                                color: channel === ch.value ? ch.color : '#6b7280',
                              }}>
                              {ch.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6b7280' }}>Target Segment</label>
                        <select value={segmentId} onChange={e => setSegmentId(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                          style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }}>
                          <option value="">Select a segment…</option>
                          {segments.map(seg => (
                            <option key={seg.id} value={seg.id}>{seg.name} ({seg.customerCount} customers)</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Message */}
                  {step === 1 && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium" style={{ color: '#6b7280' }}>Campaign Message</label>
                        <button onClick={generateMessage} disabled={aiLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(124,92,191,0.12)', color: '#7c5cbf' }}>
                          <Sparkles className="w-3.5 h-3.5" />
                          {aiLoading ? 'Writing...' : 'AI Write'}
                        </button>
                      </div>
                      <textarea value={message} onChange={e => setMessage(e.target.value)}
                        placeholder={`Write your ${channel} message here…\n\nTip: Use {{name}} to personalise!`}
                        rows={8} className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                        style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0', fontFamily: 'inherit' }} />
                      <p className="text-xs" style={{ color: '#3f3f46' }}>
                        {message.length} characters · Use {'{{name}}'} for customer names
                      </p>
                    </div>
                  )}

                  {/* Step 2: Schedule */}
                  {step === 2 && (
                    <div className="flex flex-col gap-4">
                      <div className="p-4 rounded-xl border" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4" style={{ color: '#4f6ef7' }} />
                          <span className="text-sm font-medium" style={{ color: '#f0f0f0' }}>Send Time</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" checked={!scheduledAt} onChange={() => setScheduledAt('')}
                              className="w-4 h-4 accent-blue-500" />
                            <span className="text-sm" style={{ color: '#f0f0f0' }}>Save as draft (launch manually)</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" checked={!!scheduledAt} onChange={() => setScheduledAt(new Date(Date.now() + 3600000).toISOString().slice(0, 16))}
                              className="w-4 h-4 accent-blue-500" />
                            <span className="text-sm" style={{ color: '#f0f0f0' }}>Schedule for later</span>
                          </label>
                          {scheduledAt && (
                            <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                              className="ml-7 px-3 py-2 rounded-lg border text-sm outline-none"
                              style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {step === 3 && (
                    <div className="flex flex-col gap-4">
                      <div className="p-4 rounded-xl border" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
                        {[
                          { label: 'Campaign', value: name },
                          { label: 'Channel', value: channel.toUpperCase() },
                          { label: 'Segment', value: selectedSeg ? `${selectedSeg.name} (${selectedSeg.customerCount} customers)` : '—' },
                          { label: 'Schedule', value: scheduledAt ? new Date(scheduledAt).toLocaleString('en-IN') : 'Manual launch' },
                        ].map(row => (
                          <div key={row.label} className="flex justify-between py-2.5 border-b last:border-0" style={{ borderColor: '#1f1f1f' }}>
                            <span className="text-sm" style={{ color: '#6b7280' }}>{row.label}</span>
                            <span className="text-sm font-medium" style={{ color: '#f0f0f0' }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-xl border" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
                        <p className="text-xs font-medium mb-2" style={{ color: '#6b7280' }}>Message Preview</p>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: '#f0f0f0' }}>{message}</p>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: '#1f1f1f' }}>
              <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all disabled:opacity-40"
                style={{ borderColor: '#2a2a2a', color: '#6b7280' }}>
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg,#4f6ef7,#7c5cbf)', color: '#fff' }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg,#4f6ef7,#7c5cbf)', color: '#fff' }}>
                  <Send className="w-4 h-4" /> {saving ? 'Saving…' : 'Create Campaign'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
