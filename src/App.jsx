import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import { generateSchedule } from './utils/scheduler';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'neon';
  });

  const [tasks, setTasks] = useState([
    { id: 1, name: 'Projekt "Antygrawitacja"', duration: 120, priority: 1, allowSplitting: true, type: 'flex' },
    { id: 2, name: 'Trening', duration: 60, priority: 2, allowSplitting: false, type: 'flex' },
    { id: 3, name: 'Lunch', startTime: '13:00', endTime: '14:00', type: 'fixed' }
  ]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const [settings, setSettings] = useState({
    startHour: 8,
    endHour: 22,
    buffer: 10
  });

  const addTask = (task) => {
    setTasks(prev => [...prev, task]);
  };

  // Automatyczne przeliczanie planu przy każdej zmianie zadań lub ustawień
  const { items: scheduledItems, unscheduled } = useMemo(() => {
    return generateSchedule(tasks, tasks.filter(t => t.type === 'fixed'), settings);
  }, [tasks, settings]);

  return (
    <div className="app-container" style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <Sidebar 
        onAddTask={addTask} 
        settings={settings} 
        setSettings={setSettings} 
        theme={theme}
        setTheme={setTheme}
      />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Timeline 
          items={scheduledItems} 
          settings={settings} 
          unscheduled={unscheduled}
        />
        
        {/* Panel boczny / statystyki na dole jeśli potrzebne */}
        <div style={{ padding: '20px 40px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', gap: '32px' }}>
          <div className="stat">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Zadania zaplanowane</span>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>{scheduledItems.length}</span>
          </div>
          <div className="stat">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Czas pracy</span>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>
              {Math.round(scheduledItems.reduce((acc, item) => acc + (item.end - item.start), 0) / 60 * 10) / 10}h
            </span>
          </div>
          <div className="stat">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Status</span>
            <span style={{ fontWeight: '700', fontSize: '18px', color: unscheduled.length > 0 ? 'var(--warning)' : 'var(--accent)' }}>
              {unscheduled.length > 0 ? 'Przeładowany' : 'Optymalny'}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
