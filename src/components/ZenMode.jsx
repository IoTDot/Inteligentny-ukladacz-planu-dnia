import React, { useState, useEffect, useRef } from 'react';

const TRACKS = [
  { id: 'cafe', label: 'Kawiarnia', emoji: '☕', color: 'var(--primary)', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg', baseVol: 0.6 },
  { id: 'rain', label: 'Deszcz', emoji: '🌧️', color: 'var(--secondary)', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg', baseVol: 0.25 },
  { id: 'fire', label: 'Ognisko', emoji: '🔥', color: 'var(--warning)', url: 'https://actions.google.com/sounds/v1/ambiences/fire.ogg', baseVol: 0.9 },
  { id: 'waves', label: 'Fale Oceanu', emoji: '🌊', color: 'var(--accent)', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg', baseVol: 0.3 }
];

const ZenMode = ({ isOpen, onClose, activeTask }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumes, setVolumes] = useState({ cafe: 50, rain: 0, fire: 0, waves: 0 });
  const audioRefs = useRef({});

  const toggleEngine = () => {
    if (isPlaying) {
      // Wyłącz wszystko
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
      });
      setIsPlaying(false);
    } else {
      // Włącz pre-buforowane ścieżki
      Object.keys(volumes).forEach(id => {
        if (!audioRefs.current[id]) {
          const track = TRACKS.find(t => t.id === id);
          const a = new Audio(track.url);
          a.loop = true;
          a.volume = (volumes[id] / 100) * track.baseVol;
          audioRefs.current[id] = a;
        } else {
          const track = TRACKS.find(t => t.id === id);
          audioRefs.current[id].volume = (volumes[id] / 100) * track.baseVol;
        }
        audioRefs.current[id].play().catch(e => console.warn("Przeglądarka zablokowała autoodtwarzanie", e));
      });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (id, val) => {
    const newVol = parseInt(val, 10);
    setVolumes(prev => ({ ...prev, [id]: newVol }));
    if (audioRefs.current[id]) {
      const track = TRACKS.find(t => t.id === id);
      audioRefs.current[id].volume = (newVol / 100) * track.baseVol;
    }
  };

  useEffect(() => {
    if (!isOpen && isPlaying) {
      toggleEngine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isPlaying]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(audioRefs.current).forEach(a => a.pause());
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg)', zIndex: 1000, overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      animation: 'fadeIn 0.5s ease', color: 'white', padding: '40px'
    }}>
      <h1 style={{ fontSize: 'clamp(40px, 8vw, 100px)', fontWeight: '900', color: 'var(--primary)', textShadow: '0 0 50px var(--primary-glow)', letterSpacing: '-0.05em', textAlign: 'center', margin: 0, lineHeight: '1.1' }}>
        {activeTask ? activeTask.name : "Czas na skupienie."}
      </h1>
      
      {activeTask && (
        <p style={{ fontSize: '24px', color: 'var(--text-muted)', marginTop: '20px', textAlign: 'center' }}>
          Pełne skupienie. Nic innego nie ma znaczenia.
        </p>
      )}

      {/* A pulsing subtle ring in the background */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 'min(90vw, 600px)', height: 'min(90vw, 600px)',
        transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '4px solid var(--primary)',
        boxShadow: isPlaying ? '0 0 150px var(--primary-glow)' : '0 0 100px var(--primary-glow)', 
        opacity: isPlaying ? 0.2 : 0.1, pointerEvents: 'none',
        animation: isPlaying ? 'pulse 2s infinite ease-in-out' : 'pulse 4s infinite ease-in-out', 
        zIndex: -1, transition: 'all 2s ease'
      }}></div>

      {/* MIXER UI HQ API */}
      <div style={{
        display: 'flex', gap: '32px', background: 'var(--surface)', padding: '32px',
        borderRadius: '24px', border: '1px solid var(--border)', marginTop: '60px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', flexWrap: 'wrap', justifyContent: 'center'
      }}>
        {TRACKS.map(track => (
          <div key={track.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '32px' }}>{track.emoji}</div>
            <input 
              type="range" min="0" max="100" value={volumes[track.id]} 
              onChange={e => handleVolumeChange(track.id, e.target.value)}
              style={{ 
                appearance: 'slider-vertical', WebkitAppearance: 'slider-vertical',
                width: '12px', height: '140px', accentColor: track.color, cursor: 'pointer' 
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{track.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '40px', zIndex: 10 }}>
        <button onClick={toggleEngine} style={{
          padding: '16px 32px', fontSize: '16px', fontWeight: 'bold',
          background: isPlaying ? 'var(--primary)' : 'transparent', 
          color: isPlaying ? 'black' : 'var(--text-main)', 
          border: '2px solid var(--primary)',
          borderRadius: '30px', cursor: 'pointer', transition: 'all 0.3s',
          boxShadow: isPlaying ? '0 0 20px var(--primary-glow)' : 'none'
        }}>
          {isPlaying ? '🔊 Wyłącz Zasilanie' : '🎧 Odtwarzaj HQ Ambient'}
        </button>

        <button onClick={() => { if(isPlaying) toggleEngine(); onClose(); }} style={{
          padding: '16px 40px', fontSize: '16px', fontWeight: 'bold',
          background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)',
          borderRadius: '30px', cursor: 'pointer', transition: 'all 0.3s'
        }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
          Wyjdź z Trybu Zen
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.3; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.1; }
        }
        /* Custom tweaks for cross-browser vertical sliders if needed */
        input[type=range][orient=vertical] {
            writing-mode: bt-lr; /* IE */
            -webkit-appearance: slider-vertical; /* WebKit */
            width: 8px;
            height: 140px;
            padding: 0 5px;
        }
      `}</style>
    </div>
  );
};

export default ZenMode;
