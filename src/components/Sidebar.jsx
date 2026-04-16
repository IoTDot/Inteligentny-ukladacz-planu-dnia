import React, { useState } from 'react';

const Sidebar = ({ onAddTask, tasks, settings, setSettings, theme, setTheme, playerStats, onOpenManual }) => {
  const [activeTab, setActiveTab] = useState('flex'); // 'flex' lub 'fixed'
  const [isListening, setIsListening] = useState(false);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineDuration, setRoutineDuration] = useState(30);
  // awariaCount obliczany dynamicznie z tasks – odporna na usuwanie i odświeżenia strony
  const [flexTask, setFlexTask] = useState({
    name: '',
    duration: 30,
    priority: 2,
    category: 'Praca',
    allowSplitting: true,
    startTime: ''
  });

  const [fixedEvent, setFixedEvent] = useState({
    name: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  React.useEffect(() => {
    // Migracja: Jeżeli uzytkownik nie ma customRoutines, zbuduj mu domyślne, by mógł je w pełni usuwać
    if (!settings.customRoutines) {
      setSettings(prev => ({
        ...prev,
        customRoutines: [
          { name: 'Trening', duration: 60 },
          { name: 'Odpoczynek', duration: 30 }
        ]
      }));
    }
  }, [settings.customRoutines, setSettings]);

  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const handleAddFlex = (e) => {
    e.preventDefault();
    if (!flexTask.name) return;

    // Jeżeli użytkownik wpisał konkretną godzinę, to automatycznie przypinamy zadanie jako sztywne:
    if (flexTask.startTime) {
      onAddTask({ 
        name: flexTask.name,
        duration: flexTask.duration,
        startTime: flexTask.startTime,
        endTime: minutesToTime(timeToMinutes(flexTask.startTime) + flexTask.duration),
        priority: flexTask.priority,
        category: flexTask.category,
        allowSplitting: false,
        id: Date.now(), 
        type: 'fixed' 
      });
    } else {
      onAddTask({ ...flexTask, id: Date.now(), type: 'flex' });
    }

    setFlexTask({ name: '', duration: 30, priority: 2, category: 'Praca', allowSplitting: true, startTime: '' });
  };

  const handleAddFixed = (e) => {
    e.preventDefault();
    if (!fixedEvent.name) return;
    onAddTask({ ...fixedEvent, id: Date.now(), type: 'fixed' });
    setFixedEvent({ name: '', startTime: '09:00', endTime: '10:00' });
  };

  const handleExportBackup = () => {
    const data = {
      tasks: JSON.parse(localStorage.getItem('app-tasks') || '[]'),
      settings: JSON.parse(localStorage.getItem('app-settings') || '{}'),
      stats: JSON.parse(localStorage.getItem('app-player-stats') || '{}'),
      theme: localStorage.getItem('app-theme') || 'neon'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planer_zapis_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.tasks) {
          localStorage.setItem('app-tasks', JSON.stringify(data.tasks));
          if (data.settings) localStorage.setItem('app-settings', JSON.stringify(data.settings));
          if (data.stats) localStorage.setItem('app-player-stats', JSON.stringify(data.stats));
          if (data.theme) localStorage.setItem('app-theme', data.theme);
          window.location.reload(); 
        }
      } catch (err) {
        alert("Błąd podczas wgrywania zapisu.");
      }
    };
    reader.readAsText(file);
  };

  const xpProgress = playerStats ? (playerStats.xp % 100) : 0;
  const currentLevel = playerStats ? playerStats.level : 1;

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Twoja przeglądarka nie wspiera dyktowania głosem (Użyj Chrome lub Edge).");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pl-PL';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      let detectedDuration = 60;
      const minutesMatch = transcript.match(/(\d+)\s*minut/i);
      if (minutesMatch) {
         detectedDuration = parseInt(minutesMatch[1], 10);
      }
      // Proste wyczyszczenie
      let name = transcript.replace(/(\d+)\s*minut[a-z]*/i, '').replace(/dodaj/i, '').trim();
      name = name.charAt(0).toUpperCase() + name.slice(1);
      
      setFlexTask({ ...flexTask, name: name || transcript, duration: detectedDuration });
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="sidebar glass" style={{ width: '350px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px', color: 'var(--primary)' }}>Planer Dnia</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Automatycznie ułóż swój dzień.</p>
        </div>
        
        {/* XP Bar */}
        <div style={{ background: 'var(--surface)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Poziom {currentLevel}</div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--warning)', textShadow: '0 0 10px rgba(255,180,0,0.5)' }}>{playerStats?.xp} XP</div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.5)', marginTop: '4px', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${xpProgress}%`, height: '100%', background: 'var(--warning)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '-8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Szybkie Rutyny</h3>
          <button onClick={() => setIsCreatingRoutine(!isCreatingRoutine)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px', padding: 0 }}>{isCreatingRoutine ? 'Anuluj' : '+ Dodaj własną'}</button>
        </div>
        
        {isCreatingRoutine && (
          <div style={{ background: 'var(--surface)', padding: '10px', borderRadius: '8px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px dashed var(--primary)' }}>
            <input type="text" placeholder="Nazwa np. 'Czytanie'" value={routineName} onChange={e => setRoutineName(e.target.value)} style={{ padding: '6px', fontSize: '11px' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" placeholder="Minuty" value={routineDuration} onChange={e => setRoutineDuration(e.target.value)} style={{ padding: '6px', width: '60px', fontSize: '11px' }} />
              <button 
                onClick={() => {
                  if (routineName && routineDuration) {
                    const newRoutine = { name: routineName, duration: parseInt(routineDuration, 10) };
                    setSettings({ ...settings, customRoutines: [...(settings.customRoutines || []), newRoutine] });
                    setRoutineName('');
                    setIsCreatingRoutine(false);
                  }
                }}
                style={{ flex: 1, padding: '6px', background: 'var(--primary)', color: 'black', fontWeight: 'bold', fontSize: '11px' }}
              >Zapisz</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(settings.customRoutines || []).map((routine, idx) => (
             <div key={`routine-${idx}`} style={{ display: 'flex', borderRadius: '14px', overflow: 'hidden' }}>
               <button 
                onClick={() => onAddTask({ name: routine.name, duration: routine.duration, priority: 2, category: 'Rutyna', allowSplitting: false, id: Date.now(), type: 'flex' })}
                style={{ fontSize: '10px', padding: '4px 10px', background: 'var(--glass)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRight: 'none', borderRadius: '14px 0 0 14px' }}
               >
                 + {routine.name} ({routine.duration}m)
               </button>
               <button 
                 onClick={() => {
                   const updated = (settings.customRoutines || []).filter((_, i) => i !== idx);
                   setSettings({ ...settings, customRoutines: updated });
                 }}
                 style={{ fontSize: '10px', padding: '4px 6px', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', border: '1px solid var(--primary)', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRadius: '0 14px 14px 0', cursor: 'pointer' }}
                 title="Usuń procedurę"
               >✕</button>
             </div>
          ))}
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
        <button 
          onClick={() => setActiveTab('flex')}
          style={{ 
            flex: 1, 
            padding: '8px', 
            background: activeTab === 'flex' ? 'var(--primary)' : 'transparent', 
            color: activeTab === 'flex' ? 'white' : 'var(--text-muted)',
            boxShadow: activeTab === 'flex' ? '0 0 15px var(--primary-glow)' : 'none' 
          }}
        >
          Elastyczne
        </button>
        <button 
          onClick={() => setActiveTab('fixed')}
          style={{ 
            flex: 1, 
            padding: '8px', 
            background: activeTab === 'fixed' ? 'var(--secondary)' : 'transparent', 
            color: activeTab === 'fixed' ? 'white' : 'var(--text-muted)',
            boxShadow: activeTab === 'fixed' ? '0 0 15px var(--secondary-glow)' : 'none' 
          }}
        >
          Sztywne
        </button>
      </div>

      {activeTab === 'flex' ? (
        <form onSubmit={handleAddFlex} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nazwa zadania</label>
              <button 
                type="button" 
                onClick={startListening}
                style={{ 
                  background: isListening ? 'var(--warning)' : 'var(--surface)', 
                  border: isListening ? 'none' : '1px solid var(--border)', 
                  color: isListening ? 'black' : 'var(--text-main)', 
                  borderRadius: '50%', width: '28px', height: '28px', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center', 
                  cursor: 'pointer', transition: 'all 0.3s',
                  boxShadow: isListening ? '0 0 15px var(--warning)' : 'none',
                  animation: isListening ? 'pulse-dot 1s infinite' : 'none'
                }}
                title="Podyktuj zadanie (wymaga mikrofonu)"
              >
                🎙️
              </button>
            </div>
            <input 
              required
              value={flexTask.name}
              onChange={e => setFlexTask({...flexTask, name: e.target.value})}
              placeholder="np. Trening 45 minut"
              style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
            />
          </div>
          <div className="field">
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Czas trwania (min)</label>
            <input 
              type="number" 
              value={flexTask.duration} 
              onChange={e => setFlexTask({...flexTask, duration: parseInt(e.target.value) || 0})}
              style={{ width: '100%' }}
            />
          </div>
          <div className="field">
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '600', color: 'var(--accent)' }}>Godzina startu (Opcjonalnie)</label>
            <input 
              type="time" 
              value={flexTask.startTime || ''} 
              onChange={e => setFlexTask({...flexTask, startTime: e.target.value})}
              style={{ width: '100%', borderColor: flexTask.startTime ? 'var(--accent)' : 'var(--border)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="field" style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Priorytet</label>
              <select 
                value={flexTask.priority} 
                onChange={e => setFlexTask({...flexTask, priority: parseInt(e.target.value) || 2})}
                style={{ width: '100%' }}
              >
                <option value="1">Wys. (Krytyczne)</option>
                <option value="2">Śred. (Ważne)</option>
                <option value="3">Niski (Opcjonalne)</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Kategoria</label>
              <select 
                value={flexTask.category} 
                onChange={e => setFlexTask({...flexTask, category: e.target.value})}
                style={{ width: '100%' }}
              >
                <option value="Praca">Praca</option>
                <option value="Nauka">Nauka</option>
                <option value="Rozrywka">Rozrywka</option>
                <option value="Trening">Trening</option>
                <option value="Dom">Dom</option>
              </select>
            </div>
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              checked={flexTask.allowSplitting} 
              onChange={e => setFlexTask({...flexTask, allowSplitting: e.target.checked})}
              id="split"
            />
            <label htmlFor="split" style={{ fontSize: '12px', fontWeight: '500' }}>Zezwól na dzielenie zadania</label>
          </div>
          <button type="submit" style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '12px',
            boxShadow: '0 0 20px var(--primary-glow)',
            textShadow: '0 0 5px rgba(0,0,0,0.2)'
          }}>Dodaj zadanie</button>
        </form>
      ) : (
        <form onSubmit={handleAddFixed} className="task-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="field">
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Nazwa wydarzenia</label>
            <input 
              type="text" 
              placeholder="np. Spotkanie z klientem" 
              value={fixedEvent.name} 
              onChange={e => setFixedEvent({...fixedEvent, name: e.target.value})}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="field" style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Start</label>
              <input 
                type="time" 
                value={fixedEvent.startTime} 
                onChange={e => setFixedEvent({...fixedEvent, startTime: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Koniec</label>
              <input 
                type="time" 
                value={fixedEvent.endTime} 
                onChange={e => setFixedEvent({...fixedEvent, endTime: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <button type="submit" style={{ 
            background: 'var(--secondary)', 
            color: 'white', 
            padding: '12px',
            boxShadow: '0 0 20px var(--secondary-glow)',
            textShadow: '0 0 5px rgba(0,0,0,0.2)'
          }}>Dodaj spotkanie</button>
        </form>
      )}

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '13px', marginBottom: '8px' }}>Motyw</h3>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
            <button 
              onClick={() => setTheme('light')}
              style={{ flex: 1, padding: '4px', fontSize: '11px', background: theme === 'light' ? 'var(--surface)' : 'transparent', color: theme === 'light' ? 'var(--text-main)' : 'var(--text-muted)' }}
            >
              Jasny
            </button>
            <button 
              onClick={() => setTheme('neon')}
              style={{ flex: 1, padding: '4px', fontSize: '11px', background: theme === 'neon' ? 'var(--surface)' : 'transparent', color: theme === 'neon' ? 'var(--text-main)' : 'var(--text-muted)' }}
            >
              Neon
            </button>
            <button 
              onClick={() => setTheme('midnight')}
              style={{ flex: 1, padding: '4px', fontSize: '11px', background: theme === 'midnight' ? 'var(--surface)' : 'transparent', color: theme === 'midnight' ? 'var(--text-main)' : 'var(--text-muted)' }}
            >
              Nocny
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '13px', marginBottom: '8px' }}>Ustawienia dnia</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="field" style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Start</label>
              <input 
                type="number" 
                value={settings.startHour} 
                onChange={e => setSettings({...settings, startHour: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Koniec</label>
              <input 
                type="number" 
                value={settings.endHour} 
                onChange={e => setSettings({...settings, endHour: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }} title="Pauza między zadaniami">Przerwy</label>
              <input 
                type="number" 
                value={settings.buffer !== undefined ? settings.buffer : 0} 
                onChange={e => setSettings({...settings, buffer: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* SEKCJA INFRASTRUKTURY */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '40px' }}>
          
          <button 
            onClick={() => {
              const now = new Date();
              // Liczmy ile awarii naprawdę istnieje w tasks – odporna na desync
              const existingAwarie = (tasks || []).filter(t => t.name && t.name.includes('Awaria')).length;
              let currentMin = now.getHours() * 60 + now.getMinutes() + (existingAwarie * 30);
              if (currentMin < settings.startHour * 60) {
                 currentMin = settings.startHour * 60 + (existingAwarie * 30);
              }
              onAddTask({ 
                name: '🔔 Awaria (Przesunięcie dnia)', 
                duration: 30, 
                startTime: minutesToTime(currentMin), 
                endTime: minutesToTime(currentMin + 30), 
                priority: 1, 
                category: 'Przerwy', 
                allowSplitting: false, 
                id: Date.now(), 
                type: 'fixed' 
              });
            }}
            style={{ width: '100%', padding: '10px', background: 'rgba(255, 77, 77, 0.15)', border: '1px solid var(--warning)', color: 'var(--warning)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', marginBottom: '8px' }}
            onMouseOver={e => e.target.style.background = 'rgba(255, 77, 77, 0.3)'}
            onMouseOut={e => e.target.style.background = 'rgba(255, 77, 77, 0.15)'}
            title="Wciska awaryjny, zablokowany blok 30 minut w miejsce obecnego czasu, automatycznie zsuwając w dół wszystkie pozostałe luźne zadania."
          >
            🚨 Awaryjne opóźnienie (+30m)
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleExportBackup} style={{ flex: 1, padding: '8px', fontSize: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer' }}>
              Pobierz Zapis
            </button>
            <label style={{ flex: 1, padding: '8px', fontSize: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
              Wgraj Zapis
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportBackup} />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
