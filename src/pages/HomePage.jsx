import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ShareModal from '../components/ShareModal';
import SharedNoteCard from '../components/SharedNoteCard';
import NotificationToast from '../components/NotificationToast';
import FloatingButton from '../components/FloatingButton';
import { useSocket } from '../context/SocketContext';
import {
  fetchNotes,
  updateNote,
  toggleFavorite,
  togglePin,
  deleteNote,
  restoreNote,
  permanentDeleteNote,
  fetchFolders,
  fetchTags,
  deleteFolder,
  acceptShare,
  dismissShare,
} from '../services/api';
import { mergeCategories, formatDate, isHtmlContent } from '../utils/helpers';
import ReactMarkdown from 'react-markdown';
import Swal from 'sweetalert2';

function StatCard({ title, value, icon, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-4 card-glow cursor-default"
    >
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} border border-[var(--border)] flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold font-geist text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">{title}</p>
    </motion.div>
  );
}

const shareStatusStyles = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  accepted: 'bg-green-500/15 text-green-400 border-green-500/25',
  dismissed: 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]',
};

function HomePage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [sharingNote, setSharingNote] = useState(null);
  const [viewingShare, setViewingShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeFolder, setActiveFolder] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [folders, setFolders] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hiddenCategories') || '[]'); } catch { return []; }
  });

  // Layout state with localStorage persistence
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'grid');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { localStorage.setItem('viewMode', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem('sidebarCollapsed', sidebarCollapsed); }, [sidebarCollapsed]);

  const {
    receivedShares,
    sentShares,
    pendingCount,
    loadShares,
    setReceivedShares,
    setPendingCount,
  } = useSocket();

  // Load notes
  useEffect(() => {
    if (activeFilter === 'received' || activeFilter === 'sent') {
      setLoading(false);
      return;
    }
    const loadNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNotes({
          search: searchTerm,
          folder: activeFolder !== null ? activeFolder : undefined,
          sort: sortOption,
          includeDeleted: activeFilter === 'trash',
        });
        setNotes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [searchTerm, activeFolder, sortOption, activeFilter]);

  // Load folders and tags
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [f, t] = await Promise.all([fetchFolders(), fetchTags()]);
        setFolders(f);
        setAllTags(t);
      } catch {
        // Non-critical
      }
    };
    loadMeta();
  }, [notes]);

  const reloadNotes = async () => {
    const data = await fetchNotes({
      search: searchTerm,
      folder: activeFolder !== null ? activeFolder : undefined,
      sort: sortOption,
      includeDeleted: activeFilter === 'trash',
    });
    setNotes(data);
  };

  const handleDeleteFolder = async (folderName) => {
    const result = await Swal.fire({
      title: 'Delete Folder?',
      text: `"${folderName}" will be deleted. Notes inside will be moved to uncategorized.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f0f17' : '#ffffff',
      color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b',
      customClass: {
        popup: 'rounded-2xl border border-blue-400/20',
      },
    });
    if (!result.isConfirmed) return;
    try {
      await deleteFolder(folderName);
      if (activeFolder === folderName) setActiveFolder(null);
      setFolders((prev) => prev.filter((f) => f !== folderName));
      const newHidden = [...new Set([...hiddenCategories, folderName])];
      setHiddenCategories(newHidden);
      localStorage.setItem('hiddenCategories', JSON.stringify(newHidden));
      await reloadNotes();
      Swal.fire({
        title: 'Deleted!',
        text: `Folder "${folderName}" has been deleted.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f0f17' : '#ffffff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b',
        customClass: {
          popup: 'rounded-2xl border border-blue-400/20',
        },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditNote = async ({ title, body, folder, tags }) => {
    await updateNote(editingNote._id, { title, body, folder, tags });
    setEditingNote(null);
    await reloadNotes();
  };

  const handleToggleFavorite = async (id) => {
    try {
      setError(null);
      const updated = await toggleFavorite(id);
      setNotes((prev) => prev.map((note) => (note._id === id ? updated : note)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      setError(null);
      const updated = await togglePin(id);
      setNotes((prev) => prev.map((note) => (note._id === id ? updated : note)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      setError(null);
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestoreNote = async (id) => {
    try {
      setError(null);
      await restoreNote(id);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      setError(null);
      await permanentDeleteNote(id);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAcceptShare = async (shareId) => {
    try {
      setError(null);
      await acceptShare(shareId);
      setReceivedShares((prev) =>
        prev.map((s) => (s._id === shareId ? { ...s, status: 'accepted' } : s))
      );
      setPendingCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDismissShare = async (shareId) => {
    try {
      setError(null);
      await dismissShare(shareId);
      setReceivedShares((prev) =>
        prev.map((s) => (s._id === shareId ? { ...s, status: 'dismissed' } : s))
      );
      setPendingCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  const favoriteCount = notes.filter((n) => n.favorite).length;
  const pinnedCount = notes.filter((n) => n.isPinned).length;

  const filteredNotes = (() => {
    let result = notes;
    if (activeFilter === 'favorites') {
      result = result.filter((n) => n.favorite);
    } else if (activeFilter === 'recent') {
      result = result.slice(0, 5);
    } else if (activeFilter === 'pinned') {
      result = result.filter((n) => n.isPinned);
    }
    return result;
  })();

  const isShareView = activeFilter === 'received' || activeFilter === 'sent';
  const isTrashView = activeFilter === 'trash';

  const filterLabel =
    activeFilter === 'favorites'
      ? 'Favorites'
      : activeFilter === 'recent'
        ? 'Recent'
        : activeFilter === 'pinned'
          ? 'Pinned'
          : activeFilter === 'trash'
            ? 'Trash'
            : activeFilter === 'received'
              ? 'Received Notes'
              : activeFilter === 'sent'
                ? 'Sent Notes'
                : activeFolder
                  ? activeFolder
                  : 'All Notes';

  const currentShareList = activeFilter === 'received' ? receivedShares : sentShares;
  const displayCount = isShareView ? currentShareList.length : filteredNotes.length;
  const allFolders = mergeCategories(folders, hiddenCategories);

  const [trashCount, setTrashCount] = useState(0);
  useEffect(() => {
    const loadTrashCount = async () => {
      try {
        const trashNotes = await fetchNotes({ includeDeleted: true });
        setTrashCount(trashNotes.length);
      } catch {
        // Non-critical
      }
    };
    loadTrashCount();
  }, [notes]);

  const showStatCards = activeFilter === 'all' && activeFolder === null && !searchTerm && !isShareView;

  return (
    <div className="min-h-screen relative z-10">
      {/* Modals */}
      {editingNote && (
        <NoteForm
          heading="Edit Note"
          initialTitle={editingNote.title}
          initialBody={editingNote.body}
          initialFolder={editingNote.folder || ''}
          initialTags={editingNote.tags || []}
          folders={allFolders}
          onSave={handleEditNote}
          onAutoSave={async ({ title, body, folder, tags }) => {
            await updateNote(editingNote._id, { title, body, folder, tags });
          }}
          onCancel={() => setEditingNote(null)}
        />
      )}
      {sharingNote && (
        <ShareModal
          note={sharingNote}
          onClose={() => setSharingNote(null)}
          onShareSuccess={() => loadShares()}
        />
      )}

      {/* Full view modal for shared notes */}
      {viewingShare && viewingShare.noteId && (
        <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setViewingShare(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-[var(--modal-bg)] backdrop-blur-2xl border border-cyan-400/30 rounded-[20px] shadow-[0_0_60px_rgba(34,211,238,0.15),0_16px_48px_rgba(0,0,0,0.2)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div className="h-0.5 bg-gradient-to-r from-cyan-400/60 via-blue-400/40 to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-6 pb-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold font-geist text-[var(--text-primary)] break-words">
                  {viewingShare.noteId.title}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {(activeFilter === 'received' ? viewingShare.fromUserId : viewingShare.toUserId)?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {activeFilter === 'received' ? `From: ${viewingShare.fromUserId?.name}` : `To: ${viewingShare.toUserId?.name}`}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{formatDate(viewingShare.sharedAt)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${shareStatusStyles[viewingShare.status]}`}>
                    {viewingShare.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingShare(null)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tags */}
            {viewingShare.noteId.tags && viewingShare.noteId.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-6 pt-3">
                {viewingShare.noteId.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/25">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Note content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed prose-p:my-2 prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-code:text-cyan-400 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                {isHtmlContent(viewingShare.noteId.body) ? (
                  <div dangerouslySetInnerHTML={{ __html: viewingShare.noteId.body }} />
                ) : (
                  <ReactMarkdown>{viewingShare.noteId.body || 'No content'}</ReactMarkdown>
                )}
              </div>
            </div>

            {/* Footer actions for pending received shares */}
            {activeFilter === 'received' && viewingShare.status === 'pending' && (
              <div className="flex gap-3 px-6 py-4 border-t border-[var(--border)]">
                <button
                  onClick={() => { handleAcceptShare(viewingShare._id); setViewingShare((prev) => ({ ...prev, status: 'accepted' })); }}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all duration-300"
                >
                  Accept
                </button>
                <button
                  onClick={() => { handleDismissShare(viewingShare._id); setViewingShare((prev) => ({ ...prev, status: 'dismissed' })); }}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all duration-300"
                >
                  Dismiss
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <NotificationToast />

      {/* Navbar */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pendingCount={pendingCount}
        onNotificationClick={() => {
          setActiveFilter((prev) => prev === 'received' ? 'all' : 'received');
          setPendingCount(0);
        }}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      {/* Sidebar */}
      <Sidebar
        noteCount={notes.length}
        favoriteCount={favoriteCount}
        pinnedCount={pinnedCount}
        trashCount={trashCount}
        activeFilter={activeFilter}
        onFilterChange={(f) => { setActiveFilter(f); setActiveFolder(null); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        receivedShareCount={receivedShares.length}
        sentShareCount={sentShares.length}
        folders={allFolders}
        activeFolder={activeFolder}
        onFolderChange={(folder) => { setActiveFolder(folder); setActiveFilter('all'); }}
        onDeleteFolder={handleDeleteFolder}
      />

      {/* Main content */}
      <div className={`min-h-screen transition-all duration-300 pt-16 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>


        {/* Share view toggle (when in share view) */}
        {isShareView && (
          <div className="sticky top-16 z-20 bg-[var(--surface)]/60 backdrop-blur-xl border-b border-[var(--border)]">
            <div className="flex items-center gap-1 px-4 lg:px-6 py-2">
              <button
                onClick={() => setActiveFilter('received')}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeFilter === 'received' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Received
                {activeFilter === 'received' && (
                  <motion.div layoutId="shareTab" className="absolute inset-0 bg-cyan-400/10 border border-cyan-400/25 rounded-xl -z-10" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
              </button>
              <button
                onClick={() => setActiveFilter('sent')}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeFilter === 'sent' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Sent
                {activeFilter === 'sent' && (
                  <motion.div layoutId="shareTab" className="absolute inset-0 bg-blue-400/10 border border-blue-400/25 rounded-xl -z-10" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
              </button>
              <button
                onClick={() => { setActiveFilter('all'); setActiveFolder(null); }}
                className="ml-auto text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5"
              >
                Back to Notes
              </button>
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="px-4 lg:px-6 py-5 max-w-full">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl py-2.5 px-4 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Dashboard stat cards */}
          {showStatCards && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
            >
              <StatCard
                title="Total Notes"
                value={notes.length}
                gradient="from-blue-500/20 to-blue-600/10"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Favorites"
                value={favoriteCount}
                gradient="from-yellow-500/20 to-amber-500/10"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
              />
              <StatCard
                title="Categories"
                value={allFolders.length}
                gradient="from-purple-500/20 to-violet-500/10"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Pinned"
                value={pinnedCount}
                gradient="from-cyan-500/20 to-teal-500/10"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm6 7a1 1 0 10-2 0v5a1 1 0 102 0v-5zm-3-1a1 1 0 011-1h2a1 1 0 011 1v1H8v-1z" />
                  </svg>
                }
              />
            </motion.div>
          )}

          {/* Filter heading */}
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold font-geist text-[var(--text-primary)]">{filterLabel}</h2>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-[var(--surface-hover)] text-[var(--text-muted)] font-medium tabular-nums">
              {displayCount}
            </span>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isShareView ? (
              currentShareList.length > 0 ? (
                <motion.div
                  key="shares"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={viewMode === 'list' ? 'notes-list' : 'notes-grid'}
                >
                  {currentShareList.map((share, index) => (
                    <motion.div
                      key={share._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                    >
                      <SharedNoteCard
                        share={share}
                        type={activeFilter}
                        onAccept={handleAcceptShare}
                        onDismiss={handleDismissShare}
                        onView={setViewingShare}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="empty-shares" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
                  <div className="inline-block bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-8 card-glow">
                    <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-400/20 border border-[var(--border)] flex items-center justify-center">
                      {activeFilter === 'received' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z M12 18v-6m0 0l-3 3m3-3l3 3" />
                        </svg>
                      )}
                    </div>
                    <h2 className="text-base font-semibold font-geist text-[var(--text-primary)] mb-1.5">
                      {activeFilter === 'received' ? 'No received notes' : 'No sent notes'}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
                      {activeFilter === 'received'
                        ? 'Notes shared with you will appear here.'
                        : 'Share a note using the send icon on any note.'}
                    </p>
                  </div>
                </motion.div>
              )
            ) : loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
                <div className="inline-flex items-center gap-2.5">
                  <div className="h-5 w-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  <p className="text-[var(--text-muted)] text-sm">Loading notes...</p>
                </div>
              </motion.div>
            ) : filteredNotes.length > 0 ? (
              <motion.div
                key="notes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={viewMode === 'list' ? 'notes-list' : 'notes-grid'}
              >
                {filteredNotes.map((note, index) => (
                  <motion.div
                    key={note._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                  >
                    <NoteCard
                      note={note}
                      onEdit={setEditingNote}
                      onToggleFavorite={handleToggleFavorite}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDeleteNote}
                      onShare={setSharingNote}
                      isTrashView={isTrashView}
                      onRestore={handleRestoreNote}
                      onPermanentDelete={handlePermanentDelete}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
                <div className="inline-block bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-8 card-glow">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-[var(--border)] flex items-center justify-center">
                    {isTrashView ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ) : activeFilter === 'favorites' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-base font-semibold font-geist text-[var(--text-primary)] mb-1.5">
                    {isTrashView
                      ? 'Trash is empty'
                      : activeFilter === 'favorites'
                        ? 'No favorites yet'
                        : activeFilter === 'pinned'
                          ? 'No pinned notes'
                          : searchTerm
                            ? 'No notes found'
                            : 'No notes yet'}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
                    {isTrashView
                      ? 'Deleted notes will appear here.'
                      : activeFilter === 'favorites'
                        ? 'Star a note to add it to favorites.'
                        : activeFilter === 'pinned'
                          ? 'Pin a note to keep it at the top.'
                          : searchTerm
                            ? 'Try a different search term.'
                            : 'Click + New Note to create your first note.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Floating new note button - bottom right */}
      {!isTrashView && !isShareView && (
        <FloatingButton onClick={() => navigate('/dashboard/new')} />
      )}
    </div>
  );
}

export default HomePage;
