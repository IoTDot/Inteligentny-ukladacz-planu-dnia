/**
 * Utils for exporting data (e.g. to ICS format)
 */

export const generateICS = (items) => {
  const now = new Date();
  
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Inteligentny Planer Dnia//PL',
    'CALSCALE:GREGORIAN'
  ];

  const formatICSDate = (date) => {
    // Converts Date object to ICS basic UTC format: YYYYMMDDTHHmmssZ
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  items.forEach(item => {
    // We assume the schedule is for "today"
    const startObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startObj.setMinutes(startObj.getMinutes() + item.start);

    const endObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endObj.setMinutes(endObj.getMinutes() + item.end);

    icsLines.push(
      'BEGIN:VEVENT',
      `UID:${item.id || Date.now()}-${Math.random()}@planer`,
      `SUMMARY:${item.name}`,
      `DTSTAMP:${formatICSDate(now)}`,
      `DTSTART:${formatICSDate(startObj)}`,
      `DTEND:${formatICSDate(endObj)}`,
      `DESCRIPTION:Zadanie wygenerowane przez aplikację Inteligentny Planer Dnia. Priorytet: ${item.priority || 'Brak'}`,
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');

  return icsLines.join('\r\n');
};

export const downloadICS = (items, filename = 'plan_dnia.ics') => {
  const activeItems = items.filter(item => !item.completed);
  if (!activeItems || activeItems.length === 0) {
    alert("Brak nieukończonych zadań do eksportu.");
    return;
  }
  
  const content = generateICS(activeItems);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
