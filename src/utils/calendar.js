export function getCurrentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

export function generateCalendarDays(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month === 0 ? 11 : month - 1);
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  const todayKey = formatDateKey(new Date());
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(prevYear, prevMonth, day);
    cells.push({
      date,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: formatDateKey(date) === todayKey,
      dateKey: formatDateKey(date),
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: formatDateKey(date) === todayKey,
      dateKey: formatDateKey(date),
    });
  }

  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(nextYear, nextMonth, day);
    cells.push({
      date,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: formatDateKey(date) === todayKey,
      dateKey: formatDateKey(date),
    });
  }

  return cells;
}

export function groupNotesByDate(notes) {
  const map = {};
  for (const note of notes) {
    const createdKey = formatDateKey(new Date(note.createdAt));
    if (!map[createdKey]) map[createdKey] = [];
    map[createdKey].push({ ...note, _calendarReason: 'created' });

    const updatedKey = formatDateKey(new Date(note.updatedAt));
    if (updatedKey !== createdKey) {
      if (!map[updatedKey]) map[updatedKey] = [];
      map[updatedKey].push({ ...note, _calendarReason: 'edited' });
    }
  }
  return map;
}
