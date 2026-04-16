import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import PomodoroTimer from './components/PomodoroTimer';
import ZenMode from './components/ZenMode';
import ManualModal from './components/ManualModal';
import { generateSchedule, minutesToTime } from './utils/scheduler';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'neon';
  });

  const [isZenOpen, setIsZenOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('app-tasks');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Zbuduj niesamowity projekt', duration: 120, priority: 1, allowSplitting: true, type: 'flex', category: 'Praca', completed: false }
    ];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) return JSON.parse(saved);
    return {
      startHour: 8,
      endHour: 22,
      buffer: 0
    };
  });

  const [playerStats, setPlayerStats] = useState(() => {
    const saved = localStorage.getItem('app-player-stats');
    if (saved) return JSON.parse(saved);
    return { xp: 0, level: 1 };
  });

  React.useEffect(() => {
    localStorage.setItem('app-tasks', JSON.stringify(tasks));
  }, [tasks]);

  React.useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem('app-player-stats', JSON.stringify(playerStats));
  }, [playerStats]);

  const [deletedTask, setDeletedTask] = useState(null);

  const addTask = (task) => {
    setTasks(prev => [...prev, { ...task, completed: false }]);
  };

  const toggleTaskCompletion = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const xpGained = (4 - (t.priority || 2)) * 10;
        if (!t.completed) {
          // Zaznaczenie – dodaj XP
          setPlayerStats(prevStats => {
            const newXp = prevStats.xp + xpGained;
            const newLevel = Math.floor(newXp / 100) + 1;
            return { xp: newXp, level: newLevel };
          });
        } else {
          // Odznaczenie – odejmij XP (minimum 0)
          setPlayerStats(prevStats => {
            const newXp = Math.max(0, prevStats.xp - xpGained);
            const newLevel = Math.floor(newXp / 100) + 1;
            return { xp: newXp, level: newLevel };
          });
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const changeDuration = (id, delta) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id && t.type === 'flex') {
        const newDuration = Math.max(15, (t.duration || 60) + delta);
        return { ...t, duration: newDuration };
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete) {
      setDeletedTask(taskToDelete);
      setTasks(prev => prev.filter(t => t.id !== id));
      // Auto-ukryj toast po 5 sekundach
      setTimeout(() => setDeletedTask(prev => prev && prev.id === taskToDelete.id ? null : prev), 5000);
    }
  };

  const undoDelete = () => {
    if (deletedTask) {
      setTasks(prev => [...prev, deletedTask]);
      setDeletedTask(null);
    }
  };

  const pinTask = (id, startMin, endMin) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, type: 'fixed', startTime: minutesToTime(startMin), endTime: minutesToTime(endMin) };
      }
      return t;
    }));
  };

  const updateTaskTime = (id, newStartMin, newEndMin) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          type: 'fixed',
          startTime: minutesToTime(newStartMin),
          endTime: minutesToTime(newEndMin)
        };
      }
      return t;
    }));
  };

  const renameTask = (id, newName) => {
    if (!newName.trim()) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, name: newName.trim() } : t));
  };

  // Automatyczne przeliczanie planu przy każdej zmianie zadań lub ustawień
  const { items: scheduledItems, unscheduled } = useMemo(() => {
    return generateSchedule(tasks, tasks.filter(t => t.type === 'fixed'), settings);
  }, [tasks, settings]);

  // Szukaj zadania aktualnie trwającego TERAZ (nie "pierwszego nieukończonego")
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const activeTask = scheduledItems.find(item => !item.completed && currentMin >= item.start && currentMin < item.end) 
    || scheduledItems.find(item => !item.completed) 
    || null;
  // Fix #4: Escape zamyka modale
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isZenOpen) setIsZenOpen(false);
        if (isManualOpen) setIsManualOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isZenOpen, isManualOpen]);

  return (
    <div className="app-container" style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <Sidebar 
        onAddTask={addTask} 
        tasks={tasks}
        settings={settings} 
        setSettings={setSettings} 
        theme={theme}
        setTheme={setTheme}
        playerStats={playerStats}
        onOpenManual={() => setIsManualOpen(true)}
      />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <Timeline 
          items={scheduledItems} 
          settings={settings} 
          unscheduled={unscheduled}
          onToggleComplete={toggleTaskCompletion}
          onChangeDuration={changeDuration}
          onDeleteTask={deleteTask}
          onPinTask={pinTask}
          onUpdateTaskTime={updateTaskTime}
          onRenameTask={renameTask}
          theme={theme}
          onOpenZen={() => setIsZenOpen(true)}
          onOpenManual={() => setIsManualOpen(true)}
        />
        
        <PomodoroTimer />
        <ZenMode isOpen={isZenOpen} onClose={() => setIsZenOpen(false)} activeTask={activeTask} />
        <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
        
        {/* Panel boczny / statystyki na dole jeśli potrzebne */}
        <div style={{ padding: '20px 40px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', gap: '32px' }}>
          <div className="stat">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Postęp dnia</span>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>
              {scheduledItems.filter(i => i.completed).length} / {scheduledItems.length}
            </span>
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

        {/* Toast "Cofnij usunięcie" */}
        {deletedTask && (
          <div style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px',
            zIndex: 3000, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', animation: 'slideIn 0.3s ease'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
              Usunięto: <strong>{deletedTask.name}</strong>
            </span>
            <button onClick={undoDelete} style={{
              padding: '6px 16px', fontSize: '12px', fontWeight: '700',
              background: 'var(--primary)', color: 'black', borderRadius: '8px',
              border: 'none', cursor: 'pointer'
            }}>Cofnij</button>
            <button onClick={() => setDeletedTask(null)} style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              fontSize: '14px', cursor: 'pointer', padding: '0 4px'
            }}>✕</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
