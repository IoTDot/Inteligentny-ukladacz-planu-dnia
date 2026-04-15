import React, { useState } from 'react';

const Sidebar = ({ onAddTask, settings, setSettings, theme, setTheme }) => {
  const [activeTab, setActiveTab] = useState('flex'); // 'flex' lub 'fixed'
  
  const [flexTask, setFlexTask] = useState({
    name: '',
    duration: 60,
    priority: 2,
    allowSplitting: true
  });

  const [fixedEvent, setFixedEvent] = useState({
    name: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  const handleAddFlex = (e) => {
    e.preventDefault();
    if (!flexTask.name) return;
    onAddTask({ ...flexTask, id: Date.now(), type: 'flex' });
    setFlexTask({ name: '', duration: 60, priority: 2, allowSplitting: true });
  };

  const handleAddFixed = (e) => {
    e.preventDefault();
    if (!fixedEvent.name) return;
    onAddTask({ ...fixedEvent, id: Date.now(), type: 'fixed' });
    setFixedEvent({ name: '', startTime: '09:00', endTime: '10:00' });
  };

  return (
    <div className="sidebar glass" style={{ width: '350px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px', color: 'var(--primary)' }}>Planer Dnia</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Automatycznie ułóż swój dzień.</p>
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
        <form onSubmit={handleAddFlex} className="task-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="field">
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Nazwa zadania</label>
            <input 
              type="text" 
              placeholder="np. Nauka programowania" 
              value={flexTask.name} 
              onChange={e => setFlexTask({...flexTask, name: e.target.value})}
              style={{ width: '100%' }}
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
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Priorytet</label>
            <select 
              value={flexTask.priority} 
              onChange={e => setFlexTask({...flexTask, priority: parseInt(e.target.value) || 2})}
              style={{ width: '100%' }}
            >
              <option value="1">Wysoki (Krytyczne)</option>
              <option value="2">Średni (Ważne)</option>
              <option value="3">Niski (Jeśli starczy czasu)</option>
            </select>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
