import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotes } from '../services/api';
import { formatDate } from '../utils/helpers';
import {
  generateCalendarDays,
  formatDateKey,
  formatMonthYear,
  groupNotesByDate,
} from '../utils/calendar';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

function CalendarPage() {
  const [notes, setNotes] = useState([]);
  const [notesByDate, setNotesByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [direction, setDirection] = useState(0);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchNotes();
        setNotes(result);
        setNotesByDate(groupNotesByDate(result));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const calendarDays = useMemo(
    () => generateCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const selectedNotes = selectedDate ? (notesByDate[selectedDate] || []) : [];

  const goToPrevMonth = () => {
    setDirection(-1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setDirection(1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    const today = new Date();
    setDirection(0);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(formatDateKey(today));
  };

  const layoutWrapper = (content) => (
    <div className="min-h-screen relative z-10">
      <Navbar
        searchTerm=""
        onSearchChange={() => {}}
        pendingCount={0}
        onNotificationClick={() => {}}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
      <Sidebar
        noteCount={0}
        favoriteCount={0}
        pinnedCount={0}
        trashCount={0}
        activeFilter=""
        onFilterChange={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        receivedShareCount={0}
        sentShareCount={0}
      />
      <div
        className={`min-h-screen transition-all duration-300 pt-16 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}
      >
        {content}
      </div>
    </div>
  );

  if (loading) {
    return layoutWrapper(
      <div className="flex items-center justify-center h-[60vh]">
        <div className="inline-flex items-center gap-2.5">
          <div className="h-5 w-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return layoutWrapper(
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl py-3 px-5 text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return layoutWrapper(
    <div className="px-4 lg:px-6 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold font-geist text-[var(--text-primary)]">Calendar</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            View your notes by date
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-400/15 text-blue-300 hover:bg-blue-400/25 transition-colors"
          >
            Today
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-5 card-glow"
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={goToPrevMonth}
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold font-geist text-[var(--text-primary)]">
                {formatMonthYear(currentYear, currentMonth)}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-[var(--text-muted)] py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${currentYear}-${currentMonth}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="grid grid-cols-7 gap-1"
              >
                {calendarDays.map((cell) => {
                  const dayNotes = notesByDate[cell.dateKey] || [];
                  const noteCount = dayNotes.length;
                  const isSelected = selectedDate === cell.dateKey;

                  return (
                    <motion.button
                      key={cell.dateKey}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(cell.dateKey)}
                      className={`
                        relative flex flex-col items-center justify-center
                        aspect-square rounded-xl transition-all duration-200
                        ${cell.isCurrentMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-40'}
                        ${cell.isToday && !isSelected ? 'border border-blue-400/50 shadow-[0_0_12px_rgba(96,165,250,0.2)]' : ''}
                        ${isSelected ? 'bg-blue-400/20 border border-blue-400/40 shadow-[0_0_16px_rgba(96,165,250,0.25)]' : 'hover:bg-[var(--surface-hover)]'}
                      `}
                    >
                      <span className="text-sm font-medium">{cell.dayNumber}</span>
                      {noteCount > 0 && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          {noteCount > 1 && (
                            <span className="text-[10px] text-blue-300">{noteCount}</span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Day Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-5 card-glow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold font-geist text-[var(--text-primary)]">
                    {formatDate(selectedDate)}
                  </h3>
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-hover)] px-2 py-1 rounded-lg">
                    {selectedNotes.length} {selectedNotes.length === 1 ? 'note' : 'notes'}
                  </span>
                </div>

                {selectedNotes.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedNotes.map((note, i) => (
                      <motion.div
                        key={`${note._id}-${note._calendarReason}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)]/80 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate flex-1">
                            {note.title}
                          </p>
                          <span
                            className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              note._calendarReason === 'created'
                                ? 'bg-emerald-400/15 text-emerald-300'
                                : 'bg-amber-400/15 text-amber-300'
                            }`}
                          >
                            {note._calendarReason === 'created' ? 'Created' : 'Edited'}
                          </span>
                        </div>
                        {note.folder && (
                          <span className="inline-block text-[11px] text-blue-300 bg-blue-400/10 px-2 py-0.5 rounded-md mb-1.5">
                            {note.folder}
                          </span>
                        )}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] text-[var(--text-muted)] bg-[var(--card-bg)] px-1.5 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="text-[10px] text-[var(--text-muted)]">
                                +{note.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--text-muted)] opacity-40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-[var(--text-muted)]">No notes on this day</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-5 card-glow"
              >
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--text-muted)] opacity-30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-[var(--text-muted)]">Select a day to view notes</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
