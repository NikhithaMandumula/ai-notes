import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({
  noteCount,
  favoriteCount,
  pinnedCount,
  trashCount,
  activeFilter,
  onFilterChange,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  receivedShareCount,
  sentShareCount,
  folders = [],
  activeFolder,
  onFolderChange,
  onDeleteFolder,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAnalyticsPage = location.pathname === '/analytics';
  const isCalendarPage = location.pathname === '/calendar';

  const navItems = [
    {
      id: 'all',
      label: 'All Notes',
      count: noteCount,
      color: 'sky',
      textColor: 'text-white',
      badgeColor: 'bg-sky-400/20 text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      count: favoriteCount,
      color: 'amber',
      textColor: 'text-white',
      badgeColor: 'bg-amber-400/20 text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill={activeFilter === 'favorites' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      id: 'pinned',
      label: 'Pinned',
      count: pinnedCount,
      color: 'violet',
      textColor: 'text-white',
      badgeColor: 'bg-violet-400/20 text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm6 7a1 1 0 10-2 0v5a1 1 0 102 0v-5zm-3-1a1 1 0 011-1h2a1 1 0 011 1v1H8v-1z" />
        </svg>
      ),
    },
    {
      id: 'recent',
      label: 'Recent',
      color: 'emerald',
      textColor: 'text-white',
      badgeColor: 'bg-emerald-400/20 text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'trash',
      label: 'Trash',
      count: trashCount,
      color: 'rose',
      textColor: 'text-white',
      badgeColor: 'bg-rose-400/20 text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
  ];

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`${isCollapsed ? 'px-3 py-5' : 'p-5 pb-3'} shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {isCollapsed ? (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(96,165,250,0.35)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold font-space tracking-tight bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(96,165,250,0.4)]">
              AI Notes
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Smart note-taking</p>
          </div>
        )}
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeFilter === item.id && !isAnalyticsPage && !isCalendarPage;

            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { if (isAnalyticsPage || isCalendarPage) navigate('/dashboard'); onFilterChange(item.id); if (isOpen) onClose(); }}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl transition-all duration-300 text-left ${
                  isActive
                    ? ''
                    : 'hover:bg-[var(--surface-hover)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-blue-400/10 border border-blue-400/25 rounded-xl shadow-[0_0_12px_rgba(96,165,250,0.12)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${item.textColor}`}>{item.icon}</span>
                {!isCollapsed && <span className={`relative z-10 text-sm font-medium ${item.textColor}`}>{item.label}</span>}
                {!isCollapsed && item.count !== undefined && (
                  <span className={`relative z-10 ml-auto text-xs px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Folders section */}
        <div className={`mt-4 pt-4 border-t border-[var(--border)]`}>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Folders
            </p>
          )}
          {folders.map((folder) => {
            const isFolderActive = activeFolder === folder && !isAnalyticsPage && !isCalendarPage;
            return (
              <div key={folder} className="group/folder relative">
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { if (isAnalyticsPage || isCalendarPage) navigate('/dashboard'); onFolderChange(folder); if (isOpen) onClose(); }}
                  title={isCollapsed ? folder : undefined}
                  className={`relative flex items-center gap-3 w-full ${isCollapsed ? 'justify-center px-2' : 'px-3 pr-8'} py-2.5 rounded-xl transition-all duration-300 text-left ${
                    isFolderActive ? '' : 'hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {isFolderActive && (
                    <motion.div
                      layoutId="sidebarActive"
                      className="absolute inset-0 bg-orange-400/10 border border-orange-400/25 rounded-xl shadow-[0_0_12px_rgba(251,146,60,0.12)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 text-[16px] leading-none shrink-0">📁</span>
                  {!isCollapsed && (
                    <span className="relative z-10 text-sm font-medium truncate text-white">
                      {folder}
                    </span>
                  )}
                </motion.button>
                {!isCollapsed && onDeleteFolder && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover/folder:opacity-100 transition-all duration-200 z-10"
                    title={`Delete ${folder}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Sharing section */}
        <div className={`mt-4 pt-4 border-t border-[var(--border)] ${isCollapsed ? '' : ''}`}>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Sharing
            </p>
          )}
          <nav className="flex flex-col gap-1">
            {/* Received */}
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { if (isAnalyticsPage || isCalendarPage) navigate('/dashboard'); onFilterChange('received'); if (isOpen) onClose(); }}
              title={isCollapsed ? 'Received' : undefined}
              className={`relative flex items-center gap-3 ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl transition-all duration-300 text-left ${
                activeFilter === 'received'
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {activeFilter === 'received' && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 bg-cyan-400/10 border border-cyan-400/25 rounded-xl shadow-[0_0_12px_rgba(34,211,238,0.12)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </span>
              {!isCollapsed && <span className="relative z-10 text-sm font-medium text-white">Received</span>}
              {!isCollapsed && receivedShareCount > 0 && (
                <span className="relative z-10 ml-auto text-xs px-2 py-0.5 rounded-full bg-cyan-400/20 text-white">
                  {receivedShareCount}
                </span>
              )}
            </motion.button>

            {/* Sent */}
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { if (isAnalyticsPage || isCalendarPage) navigate('/dashboard'); onFilterChange('sent'); if (isOpen) onClose(); }}
              title={isCollapsed ? 'Sent' : undefined}
              className={`relative flex items-center gap-3 ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl transition-all duration-300 text-left ${
                activeFilter === 'sent'
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {activeFilter === 'sent' && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 bg-blue-400/10 border border-blue-400/25 rounded-xl shadow-[0_0_12px_rgba(96,165,250,0.12)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z M12 18v-6m0 0l-3 3m3-3l3 3" />
                </svg>
              </span>
              {!isCollapsed && <span className="relative z-10 text-sm font-medium text-white">Sent</span>}
              {!isCollapsed && sentShareCount > 0 && (
                <span className="relative z-10 ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-400/20 text-white">
                  {sentShareCount}
                </span>
              )}
            </motion.button>
          </nav>
        </div>

        {/* Analytics */}
        <div className={`mt-4 pt-4 border-t border-[var(--border)]`}>
          <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { navigate('/analytics'); if (isOpen) onClose(); }}
            title={isCollapsed ? 'Analytics' : undefined}
            className={`relative flex items-center gap-3 w-full ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl transition-all duration-300 text-left ${
              isAnalyticsPage
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {isAnalyticsPage && (
              <motion.div
                layoutId="sidebarActive"
                className="absolute inset-0 bg-purple-400/10 border border-purple-400/25 rounded-xl shadow-[0_0_12px_rgba(168,85,247,0.12)]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            {!isCollapsed && <span className="relative z-10 text-sm font-medium text-white">Analytics</span>}
          </motion.button>

          {/* Calendar */}
          <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { navigate('/calendar'); if (isOpen) onClose(); }}
            title={isCollapsed ? 'Calendar' : undefined}
            className={`relative flex items-center gap-3 w-full ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl transition-all duration-300 text-left mt-1 ${
              isCalendarPage
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {isCalendarPage && (
              <motion.div
                layoutId="sidebarActive"
                className="absolute inset-0 bg-teal-400/10 border border-teal-400/25 rounded-xl shadow-[0_0_12px_rgba(45,212,191,0.12)]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            {!isCollapsed && <span className="relative z-10 text-sm font-medium text-white">Calendar</span>}
          </motion.button>
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="px-3 py-4 border-t border-[var(--border)] shrink-0">
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-full p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all duration-300"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sidebar-backdrop"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] flex flex-col
          bg-[var(--surface)]/90 backdrop-blur-2xl border-r border-[var(--border)]
          transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}
          w-64
          shadow-[2px_0_20px_rgba(96,165,250,0.06)]
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default Sidebar;
