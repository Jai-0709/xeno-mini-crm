'use client';

import React from 'react';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Simulated engagement data: [day][hour] → intensity 0-100
function generateData() {
  return DAYS.map((_, d) =>
    HOURS.map(h => {
      // Peak hours: 9-12, 18-21; lower on weekends
      const dayFactor = d >= 5 ? 0.5 : 1;
      const hourFactor = (h >= 9 && h <= 12) || (h >= 18 && h <= 21) ? 1 : h >= 13 && h <= 17 ? 0.6 : 0.2;
      return Math.round(Math.random() * 80 * dayFactor * hourFactor + 5 * dayFactor);
    })
  );
}

const heatData = generateData();

function intensityToOpacity(v: number) {
  return 0.08 + (v / 100) * 0.82;
}

export function HeatmapGrid() {
  return (
    <div className="rounded-xl border p-5" style={{ background: '#161616', borderColor: '#1f1f1f' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0f0f0' }}>Send Time Heatmap</h3>
      <p className="text-xs mb-4" style={{ color: '#6b7280' }}>Optimal send times based on historical open rates</p>
      <div className="overflow-x-auto">
        <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(24, 1fr)', gap: 2, minWidth: 600 }}>
          {/* Header row: hours */}
          <div />
          {HOURS.map(h => (
            <div key={h} className="text-center text-xs pb-1" style={{ color: '#3f3f46', fontSize: 10 }}>
              {h % 4 === 0 ? `${h}h` : ''}
            </div>
          ))}

          {/* Data rows */}
          {DAYS.map((day, d) => (
            <React.Fragment key={day}>
              <div className="text-xs flex items-center" style={{ color: '#6b7280', fontSize: 11 }}>
                {day}
              </div>
              {HOURS.map(h => {
                const val = heatData[d][h];
                return (
                  <div
                    key={`${d}-${h}`}
                    className="rounded-sm transition-all cursor-default"
                    style={{
                      height: 18,
                      background: `rgba(79,110,247,${intensityToOpacity(val)})`,
                    }}
                    title={`${day} ${h}:00 — ${val}% engagement`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs" style={{ color: '#6b7280' }}>Low</span>
        <div className="flex gap-1">
          {[0.1, 0.25, 0.45, 0.65, 0.85].map(o => (
            <div key={o} className="w-5 h-3 rounded-sm" style={{ background: `rgba(79,110,247,${o})` }} />
          ))}
        </div>
        <span className="text-xs" style={{ color: '#6b7280' }}>High</span>
      </div>
    </div>
  );
}
