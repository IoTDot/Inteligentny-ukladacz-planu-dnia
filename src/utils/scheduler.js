/**
 * Inteligentny silnik planowania
 */

export const MIN_TASK_DURATION = 15; // minuty
export const DEFAULT_BUFFER = 10; // minuty przerwy

/**
 * Konwertuje format HH:mm na minuty od północy
 */
export const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Konwertuje minuty na format HH:mm
 */
export const minutesToTime = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const generateSchedule = (tasks, fixedEvents, settings) => {
  const { startHour = 8, endHour = 22, buffer = DEFAULT_BUFFER } = settings;
  const dayStart = startHour * 60;
  const dayEnd = endHour * 60;

  // 1. Przygotuj początkowy harmonogram z wydarzeniami sztywnymi
  let schedule = fixedEvents.map(event => ({
    ...event,
    start: timeToMinutes(event.startTime),
    end: timeToMinutes(event.endTime),
    type: 'fixed'
  })).sort((a, b) => a.start - b.start);

  // 2. Posortuj zadania elastyczne po priorytecie (1-najwyższy, 3-najniższy)
  const flexibleTasks = tasks
    .filter(t => t.type !== 'fixed')
    .sort((a, b) => a.priority - b.priority);

  const finalSchedule = [...schedule];
  const unscheduled = [];

  // 3. Dopasuj zadania elastyczne
  for (const task of flexibleTasks) {
    let rawDuration = task.duration;
    // Blokujemy minimalny czas na macierzy na 30m (pół pozycji kalendarzowej), dla zachowania czytelności bloku
    let durationRemaining = Math.max(30, rawDuration);
    let placed = false;

    // Próbujemy dopasować zadanie
    const gaps = getAvailableGaps(finalSchedule, dayStart, dayEnd, buffer);

    if (task.allowSplitting) {
      // Logika dzielenia taska
      for (const gap of gaps) {
        if (durationRemaining <= 0) break;
        
        const availableInGap = gap.end - gap.start;
        if (availableInGap >= MIN_TASK_DURATION + buffer) {
          const chunkDuration = Math.min(durationRemaining, availableInGap - buffer);
          
          finalSchedule.push({
            ...task,
            start: gap.start,
            end: gap.start + chunkDuration,
            id: `${task.id}-${finalSchedule.length}`,
            originalId: task.id,
            isChunk: true
          });
          
          durationRemaining -= chunkDuration;
          finalSchedule.sort((a, b) => a.start - b.start);
        }
      }
      if (durationRemaining <= 0) placed = true;
    } else {
      // Logika bez dzielenia
      for (const gap of gaps) {
        if (gap.end - gap.start >= durationRemaining + buffer) {
          finalSchedule.push({
            ...task,
            start: gap.start,
            end: gap.start + durationRemaining
          });
          finalSchedule.sort((a, b) => a.start - b.start);
          placed = true;
          break;
        }
      }
    }

    if (!placed && durationRemaining > 0) {
      unscheduled.push({ ...task, remaining: durationRemaining });
    }
  }

  return {
    items: finalSchedule.sort((a, b) => a.start - b.start),
    unscheduled
  };
};

/**
 * Znajduje wolne luki w harmonogramie
 */
function getAvailableGaps(schedule, dayStart, dayEnd, buffer) {
  const gaps = [];
  let lastEnd = dayStart;

  for (const item of schedule) {
    if (item.start > lastEnd + buffer) {
      gaps.push({ start: lastEnd + (lastEnd === dayStart ? 0 : buffer), end: item.start });
    }
    lastEnd = Math.max(lastEnd, item.end);
  }

  if (lastEnd + buffer < dayEnd) {
    gaps.push({ start: lastEnd + (lastEnd === dayStart ? 0 : buffer), end: dayEnd });
  }

  return gaps;
}
