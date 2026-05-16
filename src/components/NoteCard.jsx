import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { formatDate, formatRelativeTime, stripHtml, isHtmlContent } from '../utils/helpers';

function NoteCard({ note, onDelete, onEdit, onToggleFavorite, onTogglePin, onShare, isTrashView, onRestore, onPermanentDelete, viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="group flex items-center gap-4 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-xl px-4 py-3 hover:border-blue-400/30 transition-all duration-300"
      >
        {/* Pin indicator */}
        <div className="w-5 shrink-0 flex justify-center">
          {note.isPinned && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm6 7a1 1 0 10-2 0v5a1 1 0 102 0v-5zm-3-1a1 1 0 011-1h2a1 1 0 011 1v1H8v-1z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium font-geist text-[var(--text-primary)] truncate w-48 shrink-0">{note.title}</h3>

        {/* Body preview */}
        <p className="text-sm text-[var(--text-secondary)] truncate flex-1 min-w-0">
          {stripHtml(note.body).slice(0, 120) || 'No content'}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {note.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-400/15 text-blue-300 border border-blue-400/20">
                #{tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-[11px] text-[var(--text-muted)]">+{note.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Date */}
        <span className="text-[11px] text-[var(--text-muted)] shrink-0 hidden sm:block w-20 text-right">
          {formatDate(note.createdAt)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isTrashView ? (
            <>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onRestore(note._id)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-green-400 transition-colors" title="Restore">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onPermanentDelete(note._id)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 transition-colors" title="Delete permanently">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </>
          ) : (
            <>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onToggleFavorite(note._id)} className={`p-1.5 rounded-lg transition-colors ${note.favorite ? 'text-yellow-400' : 'text-[var(--text-secondary)] hover:text-yellow-400'}`} title={note.favorite ? 'Unfavorite' : 'Favorite'}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={note.favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </motion.button>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onShare(note)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-cyan-400 transition-colors" title="Share">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z M12 18v-6m0 0l-3 3m3-3l3 3" />
                </svg>
              </motion.button>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(note)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-blue-300 transition-colors" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(note._id)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 transition-colors" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-[var(--card-bg)]/80 backdrop-blur-2xl border border-[var(--border)] rounded-2xl overflow-hidden card-glow hover:border-blue-400/40 transition-all duration-500 ease-out flex flex-col min-h-[240px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.05] via-transparent to-cyan-400/[0.04] pointer-events-none" />
      <div className="h-0.5 bg-gradient-to-r from-blue-400/60 via-cyan-400/40 to-transparent relative z-10" />
      <div className="p-4 flex flex-col gap-3 flex-1 relative z-10 overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {note.isPinned && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm6 7a1 1 0 10-2 0v5a1 1 0 102 0v-5zm-3-1a1 1 0 011-1h2a1 1 0 011 1v1H8v-1z" />
              </svg>
            )}
            <h3 className="text-base font-semibold font-geist text-[var(--text-primary)] truncate">
              {note.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isTrashView ? (
              <>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onRestore(note._id)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-green-400 hover:bg-green-400/10 transition-all duration-300" aria-label="Restore note">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onPermanentDelete(note._id)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 transition-all duration-300" aria-label="Permanently delete">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onTogglePin(note._id)} className={`p-2 rounded-xl transition-all duration-300 ${note.isPinned ? 'text-blue-400' : 'text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-400/10'}`} aria-label={note.isPinned ? 'Unpin' : 'Pin'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm6 7a1 1 0 10-2 0v5a1 1 0 102 0v-5zm-3-1a1 1 0 011-1h2a1 1 0 011 1v1H8v-1z" />
                  </svg>
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onToggleFavorite(note._id)} className={`p-2 rounded-xl transition-all duration-300 ${note.favorite ? 'text-yellow-400' : 'text-[var(--text-secondary)] hover:text-yellow-400 hover:bg-yellow-400/10'}`} aria-label={note.favorite ? 'Unfavorite' : 'Favorite'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill={note.favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onShare(note)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300" aria-label="Share">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z M12 18v-6m0 0l-3 3m3-3l3 3" />
                  </svg>
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(note)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-300" aria-label="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(note._id)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 transition-all duration-300" aria-label="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </>
            )}
          </div>
        </div>

        <div className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-4 prose prose-sm max-w-none prose-p:m-0 prose-headings:m-0 prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-code:text-cyan-400 flex-1 overflow-hidden">
          {isHtmlContent(note.body) ? (
            <div dangerouslySetInnerHTML={{ __html: note.body }} />
          ) : (
            <ReactMarkdown>{note.body || 'No content'}</ReactMarkdown>
          )}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-400/15 text-blue-300 border border-blue-400/25 shadow-[0_0_8px_rgba(96,165,250,0.15)]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            {note.folder && (
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {note.folder}
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            {formatRelativeTime(note.updatedAt || note.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default NoteCard;
