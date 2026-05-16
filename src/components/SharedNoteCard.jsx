import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { formatDate, stripHtml, isHtmlContent } from '../utils/helpers';

const statusStyles = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  accepted: 'bg-green-500/15 text-green-400 border-green-500/25',
  dismissed: 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]',
};

function SharedNoteCard({ share, type, onAccept, onDismiss, onView, viewMode = 'grid' }) {
  const note = share.noteId;
  const otherUser = type === 'received' ? share.fromUserId : share.toUserId;

  if (!note) return null;

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="group flex items-center gap-4 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-xl px-4 py-3 hover:border-cyan-400/30 transition-all duration-300 cursor-pointer"
        onClick={() => onView && onView(share)}
      >
        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 shrink-0" />
        <h3 className="text-sm font-medium font-geist text-[var(--text-primary)] truncate w-44 shrink-0">{note.title}</h3>
        <p className="text-sm text-[var(--text-secondary)] truncate flex-1 min-w-0">
          {stripHtml(note.body).slice(0, 120) || 'No content'}
        </p>
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {otherUser?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[100px]">
            {otherUser?.name}
          </span>
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${statusStyles[share.status]}`}>
          {share.status}
        </span>
        <span className="text-[11px] text-[var(--text-muted)] shrink-0 hidden sm:block">
          {formatDate(share.sharedAt)}
        </span>
        {type === 'received' && share.status === 'pending' && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={(e) => { e.stopPropagation(); onAccept(share._id); }} className="px-2.5 py-1 text-[11px] font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all" title="Accept">
              Accept
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDismiss(share._id); }} className="px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--text-primary)] transition-all" title="Dismiss">
              Dismiss
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-[var(--card-bg)]/80 backdrop-blur-2xl border border-[var(--border)] rounded-2xl overflow-hidden card-glow hover:border-cyan-400/40 transition-all duration-500 ease-out flex flex-col min-h-[200px] cursor-pointer"
      onClick={() => onView && onView(share)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/[0.05] via-transparent to-blue-400/[0.04] pointer-events-none" />
      <div className="h-0.5 bg-gradient-to-r from-cyan-400/60 via-blue-400/40 to-transparent relative z-10" />
      <div className="p-4 flex flex-col gap-2 flex-1 relative z-10 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold font-geist text-[var(--text-primary)] truncate">
            {note.title}
          </h3>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border shrink-0 ${statusStyles[share.status]}`}>
            {share.status}
          </span>
        </div>

        <div className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-4 prose prose-sm max-w-none prose-p:m-0 prose-headings:m-0 prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-code:text-cyan-400">
          {isHtmlContent(note.body) ? (
            <div dangerouslySetInnerHTML={{ __html: note.body }} />
          ) : (
            <ReactMarkdown>{note.body || 'No content'}</ReactMarkdown>
          )}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/25">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[var(--border)]">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {otherUser?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {type === 'received' ? `From: ${otherUser?.name}` : `To: ${otherUser?.name}`}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">{otherUser?.email}</p>
          </div>
          <span className="text-xs text-[var(--text-muted)] shrink-0">
            {formatDate(share.sharedAt)}
          </span>
        </div>

        {type === 'received' && share.status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onAccept(share._id); }}
              className="flex-1 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all duration-300"
            >
              Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(share._id); }}
              className="flex-1 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all duration-300"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default SharedNoteCard;
