import React, { useState, useEffect } from 'react';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [isVisible, setIsVisible] = useState(false); // domyślnie ukryty

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      
      const msg = mode === 'work' ? 'Zadanie skończone! Zasłużona przerwa.' : 'Koniec przerwy, wracamy do pracy!';
      
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Planer Dnia", { body: msg });
      } else {
        alert(msg);
      }

      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggle = () => setIsActive(!isActive);
  
  const setTimer = (minutes, newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(minutes * 60);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const accentColor = mode === 'work' ? 'var(--primary)' : 'var(--secondary)';

  return (
    <>
      {/* Przycisk toggle – zawsze widoczny w rogu */}
      <button
        onClick={() => setIsVisible(v => !v)}
        title={isVisible ? 'Ukryj timer' : 'Pokaż Timer Pomodoro'}
        style={{
          position: 'fixed',
          bottom: '72px',
          right: '40px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: isActive ? accentColor : 'var(--glass)',
          border: `2px solid ${accentColor}`,
          color: isActive ? 'black' : accentColor,
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2001,
          boxShadow: isActive ? `0 0 20px var(--primary-glow)` : 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
      >
        {isActive ? '⏸' : '🍅'}
      </button>

      {/* Panel timera – chowany/pokazywany */}
      {isVisible && (
        <div className="glass" style={{ 
          position: 'fixed', 
          bottom: '124px', 
          right: '40px', 
          padding: '16px 20px', 
          borderRadius: 'var(--radius)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 2000,
          minWidth: '240px',
          animation: 'slideIn 0.3s ease',
          borderLeft: `4px solid ${accentColor}`
        }}>
          {/* Wiersz tytułu z przyciskiem zamknięcia */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Pomodoro Timer
            </h4>
            <button
              onClick={() => setIsVisible(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', padding: '0 2px', cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
              title="Zamknij"
            >✕</button>
          </div>
          {/* Badge trybu – osobna linia, nie nagniata się */}
          <div style={{ width: '100%' }}>
            <span style={{ fontSize: '10px', color: accentColor, fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', background: `${accentColor}18`, padding: '2px 8px', borderRadius: '4px' }}>
              {mode === 'work' ? '🎯 Praca' : '☕ Przerwa'}
            </span>
          </div>

          <div style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            fontFamily: 'SFMono-Regular, Consolas, Courier, monospace', 
            letterSpacing: '-0.02em',
            color: isActive ? accentColor : 'var(--text-main)',
            textShadow: isActive ? `0 0 15px var(--primary-glow)` : 'none',
            transition: 'var(--transition)'
          }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button 
              onClick={toggle}
              style={{ 
                flex: 1, 
                padding: '8px', 
                fontSize: '11px', 
                background: isActive ? 'var(--surface)' : accentColor,
                color: isActive ? 'var(--text-main)' : 'black'
              }}
            >
              {isActive ? '⏸ Pauza' : '▶ Start'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '4px', width: '100%', marginTop: '4px' }}>
            <button 
              onClick={() => setTimer(25, 'work')}
              style={{ flex: 1, padding: '4px', fontSize: '10px', background: mode === 'work' ? 'rgba(255,255,255,0.08)' : 'transparent', color: mode === 'work' ? 'var(--text-main)' : 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              25m
            </button>
            <button 
              onClick={() => setTimer(50, 'work')}
              style={{ flex: 1, padding: '4px', fontSize: '10px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              50m
            </button>
            <button 
              onClick={() => setTimer(5, 'break')}
              style={{ flex: 1, padding: '4px', fontSize: '10px', background: mode === 'break' ? 'rgba(255,255,255,0.08)' : 'transparent', color: mode === 'break' ? 'var(--text-main)' : 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              5m
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PomodoroTimer;
