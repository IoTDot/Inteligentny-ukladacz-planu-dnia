import React from 'react';
import { minutesToTime } from '../utils/scheduler';

const Timeline = ({ items, settings, unscheduled }) => {
  const { startHour, endHour } = settings;
  const dayStart = startHour * 60;
  const dayEnd = endHour * 60;
  const totalMinutes = dayEnd - dayStart;
  
  // Skala: 1.2px na minutę (840 min * 1.2 = ~1000px)
  const SCALE = 1.2;

  const getPriorityColor = (p) => {
    if (p === 1) return 'var(--primary)';
    if (p === 2) return 'var(--accent)';
    return 'var(--secondary)';
  };

  const getPriorityGlow = (p) => {
    if (p === 1) return 'var(--primary-glow)';
    if (p === 2) return 'var(--accent-glow)';
    return 'var(--secondary-glow)';
  };

  return (
    <div className="timeline-container" style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'transparent' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--secondary)', textShadow: '0 0 10px var(--secondary-glow)' }}>Dzisiejszy Plan</h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {startHour}:00 - {endHour}:00
          </div>
        </div>

        {unscheduled.length > 0 && (
          <div style={{ 
            background: 'var(--warning)', 
            color: 'black', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius)', 
            marginBottom: '24px',
            fontSize: '0.875rem',
            fontWeight: '600',
            boxShadow: '0 0 20px hsla(45, 100%, 50%, 0.3)',
            animation: 'fadeIn 0.5s ease'
          }}>
            <strong>Uwaga:</strong> Nie udało się zmieścić {unscheduled.length} zadań.
          </div>
        )}

        <div className="timeline-grid" style={{ 
          position: 'relative', 
          height: `${totalMinutes * SCALE}px`,
          borderLeft: '2px solid var(--border)',
          marginLeft: '60px'
        }}>
          {/* Hour markers */}
          {Array.from({ length: endHour - startHour + 1 }).map((_, i) => {
            const h = startHour + i;
            const top = (h * 60 - dayStart) * SCALE;
            return (
              <div key={h} style={{ 
                position: 'absolute', 
                top: `${top}px`, 
                left: '-60px', 
                width: 'calc(100% + 60px)',
                height: '1px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-main)', background: 'var(--bg)', padding: '0 10px', fontWeight: '600' }}>
                  {h}:00
                </span>
              </div>
            );
          })}

          {/* Scheduled items */}
          {items.map((item, idx) => {
            const top = (item.start - dayStart) * SCALE;
            const height = (item.end - item.start) * SCALE;
            const isFixed = item.type === 'fixed';
            const color = isFixed ? 'var(--secondary)' : getPriorityColor(item.priority);
            const glow = isFixed ? 'var(--secondary-glow)' : getPriorityGlow(item.priority);
            
            return (
              <div 
                key={item.id || idx}
                className="task-block glass"
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: '10px',
                  right: '10px',
                  height: `${height - 4}px`, 
                  borderRadius: '12px',
                  padding: '10px 16px',
                  borderLeft: `4px solid ${color}`,
                  boxShadow: `0 4px 15px rgba(0,0,0,0.5), 0 0 10px ${glow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: height > 40 ? 'flex-start' : 'center',
                  overflow: 'hidden',
                  transition: 'all 0.4s ease',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: 'white' }}>{item.name}</span>
                  <span style={{ fontSize: '11px', color: color, fontWeight: '700' }}>
                    {minutesToTime(item.start)} - {minutesToTime(item.end)}
                  </span>
                </div>
                {height > 40 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {isFixed ? 'Wydarzenie stałe' : `Priorytet: ${item.priority}`}
                    {item.isChunk && ' (Część)'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Timeline;
