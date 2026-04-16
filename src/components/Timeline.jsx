import React, { useState, useEffect, useRef } from 'react';
import { minutesToTime, timeToMinutes } from '../utils/scheduler';
import { downloadICS } from '../utils/export';
import confetti from 'canvas-confetti';

const Timeline = ({ items, settings, unscheduled, onToggleComplete, onChangeDuration, onDeleteTask, onPinTask, onUpdateTaskTime, onRenameTask, theme, onOpenZen, onOpenManual }) => {
  const { startHour, endHour } = settings;
  const dayStart = startHour * 60;
  const dayEnd = endHour * 60;
  const totalMinutes = dayEnd - dayStart;
  
  // Dynamiczna kompresja rozmiaru do ekranu laptopów
  const [SCALE, setSCALE] = useState(() => {
    const availableSpace = window.innerHeight - 190;
    let dynamic = availableSpace / totalMinutes;
    return Math.max(0.5, Math.min(1.5, dynamic));
  });

  useEffect(() => {
    const handleResize = () => {
      const availableSpace = window.innerHeight - 190;
      let dynamic = availableSpace / totalMinutes;
      setSCALE(Math.max(0.5, Math.min(1.5, dynamic)));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [totalMinutes]);

  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // --- DRAG AND DROP STATE ---
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragStartY = useRef(0);
  const dragItemOriginalTop = useRef(0);

  // --- INLINE NAME EDITING STATE ---
  const [editingNameId, setEditingNameId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  
  const isDarkTheme = theme !== 'light';
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000); // Kopia co 1 minutę
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!draggingId) return;

    const handlePointerMove = (e) => {
      const draggedItem = items.find(i => (i.originalId || i.id) === draggingId);
      const deltaY = e.clientY - dragStartY.current;
      if (draggedItem) {
        // Klampuj wizualny offset tak by kafelek nie wychodził poza siatkę
        const duration = draggedItem.end - draggedItem.start;
        const minDeltaY = (dayStart - draggedItem.start) * SCALE; // górna granica
        const maxDeltaY = (dayEnd - duration - draggedItem.start) * SCALE; // dolna granica
        setDragOffsetY(Math.max(minDeltaY, Math.min(maxDeltaY, deltaY)));
      } else {
        setDragOffsetY(deltaY);
      }
    };

    const handlePointerUp = () => {
      if (draggingId) {
        // Przeliczenie offsetu px na minuty, skok co 15 minut
        const draggedItem = items.find(i => (i.originalId || i.id) === draggingId);
        if (draggedItem) {
          const deltaMinutes = dragOffsetY / SCALE;
          const snappedDelta = Math.round(deltaMinutes / 15) * 15;
          const duration = draggedItem.end - draggedItem.start;
          
          // Klampuj żeby kafelek nie wyszedł poza ramy dnia
          const rawStart = draggedItem.start + snappedDelta;
          const clampedStart = Math.max(dayStart, Math.min(dayEnd - duration, rawStart));
          
          if (clampedStart !== draggedItem.start) {
            onUpdateTaskTime(draggingId, clampedStart, clampedStart + duration);
          }
        }
      }
      setDraggingId(null);
      setDragOffsetY(0);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingId, dragOffsetY, SCALE, items, onUpdateTaskTime]);

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

  const handleTaskCheck = (id, priority, isCurrentlyCompleted) => {
    onToggleComplete(id);
    if (!isCurrentlyCompleted && priority === 1) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff4d4d', '#ffb400', '#00ffcc']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff4d4d', '#ffb400', '#00ffcc']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else if (!isCurrentlyCompleted) {
      // Drobniejsze konfetti dla średnich zadań
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00ffcc', '#ffb400']
      });
    }
  };

  return (
    <div className="timeline-container" style={{ flex: 1, padding: '24px 40px', overflowY: 'auto', background: 'transparent' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--secondary)', textShadow: '0 0 10px var(--secondary-glow)' }}>Dzisiejszy Plan</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {startHour}:00 - {endHour}:00
            </div>
            
            <button 
              onClick={onOpenZen}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                padding: '6px 12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 10px var(--primary-glow)',
                fontWeight: 'bold'
              }}
            >
              🧘 Tryb Zen
            </button>

            <button
              onClick={onOpenManual}
              title="Instrukcja Obsługi"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              ?
            </button>

            <button 
              onClick={() => downloadICS(items)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Eksport
            </button>
          </div>
        </div>

        {unscheduled.length > 0 && (
          <div style={{ 
            background: 'var(--surface)', 
            color: 'var(--text-main)', 
            padding: '16px', 
            borderRadius: 'var(--radius)', 
            marginBottom: '24px',
            border: '1px solid var(--warning)',
            boxShadow: '0 0 20px hsla(45, 100%, 50%, 0.1)',
            animation: 'fadeIn 0.5s ease'
          }}>
            <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '8px' }}>Oczekujące na Jutro (Backlog): {unscheduled.length}</strong>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
              {unscheduled.map(u => (
                <li key={u.id}>{u.name} ({u.duration ? `${u.duration}m` : 'Stałe'})</li>
              ))}
            </ul>
          </div>
        )}

        <div className="timeline-grid" style={{ 
          position: 'relative', 
          height: `${totalMinutes * SCALE}px`,
          borderLeft: '2px solid var(--border)',
          marginLeft: '40px'
        }}>
          {/* Hour markers */}
          {Array.from({ length: endHour - startHour + 1 }).map((_, i) => {
            const h = startHour + i;
            const top = (h * 60 - dayStart) * SCALE;
            return (
              <div key={h} style={{ 
                position: 'absolute', 
                top: `${top}px`, 
                left: '-40px', 
                width: 'calc(100% + 40px)',
                height: '1px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-main)', background: 'var(--bg)', padding: '0 8px', fontWeight: '600' }}>
                  {h}:00
                </span>
              </div>
            );
          })}

          {/* Linie Czasu Rzeczywistego (The Now Line) */}
          {currentMinutes > dayStart && currentMinutes < dayEnd && (
            <div style={{
              position: 'absolute',
              top: `${(currentMinutes - dayStart) * SCALE}px`,
              left: '-10px',
              width: 'calc(100% + 10px)',
              height: '2px',
              background: '#f94144',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 0 10px rgba(249, 65, 68, 0.8)'
            }}>
              <div style={{
                position: 'absolute',
                left: '-6px',
                width: '8px',
                height: '8px',
                background: '#f94144',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgba(249, 65, 68, 1)',
                animation: 'pulse-dot 2s infinite'
              }}></div>
            </div>
          )}

          {/* Scheduled items */}
          {items.map((item, idx) => {
            const top = (item.start - dayStart) * SCALE;
            const height = (item.end - item.start) * SCALE;
            const isFixed = item.type === 'fixed';
            const isCompleted = item.completed;
            const baseColor = isFixed ? 'var(--secondary)' : getPriorityColor(item.priority);
            const color = isCompleted ? 'var(--text-muted)' : baseColor;
            const glow = isCompleted ? 'transparent' : (isFixed ? 'var(--secondary-glow)' : getPriorityGlow(item.priority));
            
            const actualId = item.originalId || item.id;

            // Compute actual visual overlap with current time line
            const isHappeningNow = currentMinutes >= item.start && currentMinutes < item.end && !isCompleted;
            const hPx = Math.max(4, height - 2);

            const isDragging = draggingId === actualId;
            const currentTransform = isDragging ? `translateY(${dragOffsetY}px)` : 'none';

            return (
              <div 
                key={item.id || idx}
                className={`task-block ${isDragging ? 'dragging' : ''}`}
                onPointerDown={(e) => {
                  // Prevent dragging from inputs/buttons
                  if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDraggingId(actualId);
                  dragStartY.current = e.clientY;
                }}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: '10px',
                  right: '10px',
                  height: `${hPx}px`, 
                  borderRadius: '12px',
                  padding: hPx < 40 ? (hPx < 24 ? '0 10px' : '2px 12px') : '10px 16px',
                  background: 'var(--surface)',
                  borderLeft: `4px solid ${color}`,
                  boxShadow: isDragging
                    ? '0 20px 40px rgba(0,0,0,0.4)'
                    : isDarkTheme
                      ? (isHappeningNow ? `0 4px 15px rgba(0,0,0,0.5), 0 0 25px ${glow}` : `0 4px 15px rgba(0,0,0,0.5), 0 0 10px ${glow}`)
                      : (isHappeningNow ? `0 2px 12px rgba(0,0,0,0.15), 0 0 0 2px ${color}40` : '0 2px 8px rgba(0,0,0,0.08)'),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: hPx > 50 ? 'flex-start' : 'center',
                  overflow: 'hidden',
                  opacity: isCompleted ? 0.6 : (isDragging ? 0.9 : 1),
                  transform: currentTransform,
                  zIndex: isDragging ? 100 : 10,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: isDragging ? 'none' : 'auto',
                  transition: isDragging ? 'none' : 'all 0.4s ease',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                {isHappeningNow && (
                  <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: `${Math.min(100, Math.max(0, ((currentMinutes - item.start) / (item.end - item.start)) * 100))}%`,
                    background: color,
                    opacity: 0.15,
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'width 60s linear'
                  }} />
                )}
                
                {/* Zawartość musi być wyniesiona ponad pasek */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: hPx > 50 ? 'flex-start' : 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!isFixed && hPx >= 20 && (
                      <input 
                        type="checkbox" 
                        checked={isCompleted} 
                        onChange={() => handleTaskCheck(actualId, item.priority, isCompleted)}
                        style={{ cursor: 'pointer', accentColor: baseColor }}
                      />
                    )}
                    {editingNameId === actualId ? (
                      <input
                        autoFocus
                        value={editingNameValue}
                        onChange={e => setEditingNameValue(e.target.value)}
                        onBlur={() => {
                          onRenameTask(actualId, editingNameValue);
                          setEditingNameId(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { onRenameTask(actualId, editingNameValue); setEditingNameId(null); }
                          if (e.key === 'Escape') setEditingNameId(null);
                        }}
                        style={{ background: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: '1px solid var(--primary)', borderRadius: '4px', color: 'var(--text-main)', fontWeight: '700', fontSize: hPx < 24 ? '11px' : '13px', outline: 'none', padding: '1px 6px', maxWidth: '180px' }}
                      />
                    ) : (
                      <span
                        onDoubleClick={() => { setEditingNameId(actualId); setEditingNameValue(item.name); }}
                        title="Kliknij dwukrotnie aby edytować nazwę"
                        style={{ fontWeight: '700', fontSize: hPx < 24 ? '11px' : '13px', color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isCompleted ? 'line-through' : 'none', cursor: 'text' }}
                      >
                        {item.name}
                      </span>
                    )}
                    
                    {/* Metadata moved to be inline with title to save vertical space */}
                    {((item.end - item.start) >= 20) && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        {isFixed ? '(Sztywne)' : `Pr.${item.priority}`}
                        {item.isChunk && ' (Tworzy serię)'}
                        {item.category && ` • ${item.category}`}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="task-controls" style={{ display: 'flex', gap: '4px' }}>
                      {!isFixed && (
                        <>
                          <button onClick={() => onChangeDuration(actualId, -15)} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--glass)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>-15m</button>
                          <button onClick={() => onChangeDuration(actualId, 15)} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--glass)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>+15m</button>
                          <button onClick={() => onPinTask(actualId, item.start, item.end)} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--glass)', color: 'var(--text-main)', border: '1px solid var(--border)' }} title="Przypnij na stałe">📌</button>
                        </>
                      )}
                      <button onClick={() => onDeleteTask(actualId)} style={{ fontSize: '10px', padding: '2px 6px', background: 'transparent', color: 'var(--warning)', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <input 
                        type="time" 
                        value={minutesToTime(item.start)} 
                        onChange={(e) => {
                           const newStart = timeToMinutes(e.target.value);
                           const duration = item.end - item.start; // zachowaj długość zadania
                           onUpdateTaskTime(actualId, newStart, newStart + duration);
                        }}
                        style={{ background: 'transparent', border: 'none', color: baseColor, fontWeight: '700', fontSize: '11px', outline: 'none', cursor: 'text', padding: 0, width: '36px', colorScheme: isDarkTheme ? 'dark' : 'light' }}
                        className="task-time-input"
                      />
                      <span style={{ fontSize: '11px', color: baseColor, fontWeight: '700' }}>–</span>
                      <input 
                        type="time" 
                        value={minutesToTime(item.end)} 
                        onChange={(e) => {
                           const newEnd = timeToMinutes(e.target.value);
                           if (newEnd > item.start) {
                             onUpdateTaskTime(actualId, item.start, newEnd);
                           }
                        }}
                        style={{ background: 'transparent', border: 'none', color: baseColor, fontWeight: '700', fontSize: '11px', outline: 'none', cursor: 'text', padding: 0, width: '36px', colorScheme: isDarkTheme ? 'dark' : 'light' }}
                        className="task-time-input"
                      />
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse-dot { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        /* Custom checkbox style to blend better */
        input[type="checkbox"] {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: rgba(0,0,0,0.2);
          margin: 0;
          padding: 0;
        }
        .task-controls {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .task-block:hover .task-controls {
          opacity: 1;
        }
        /* Ukryj ikonkę kalendarza na kafelkach – wpisujemy klikając cyfry bezpośrednio */
        .task-time-input::-webkit-calendar-picker-indicator {
          display: none;
        }
        /* Kliknięcie na cały input pokazuje natywny picker */
        .task-time-input {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Timeline;
