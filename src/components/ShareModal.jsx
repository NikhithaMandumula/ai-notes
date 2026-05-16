import { useState } from 'react';
import { shareNote } from '../services/api';

function ShareModal({ note, onClose, onShareSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await shareNote(note._id, email.trim());
      setSuccess(`Note shared with ${email.trim()}`);
      setEmail('');
      if (onShareSuccess) onShareSuccess();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-md flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleShare}
        className="relative bg-[var(--modal-bg)] backdrop-blur-2xl border border-blue-400/25 rounded-[20px] shadow-[0_0_60px_rgba(96,165,250,0.18),0_16px_48px_rgba(0,0,0,0.2)] w-full max-w-md p-6 flex flex-col gap-4"
      >
        <div>
          <h2 className="text-xl font-bold font-geist tracking-tight text-[var(--text-primary)]">Share Note</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Share &ldquo;{note.title}&rdquo; with another user
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-[14px] py-3 px-4 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-[14px] py-3 px-4 text-sm text-green-400">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Recipient Email</label>
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
            <input
              type="email"
              placeholder="Enter user's email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              className="relative w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[14px] hover:bg-[var(--surface)] transition-all duration-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!email.trim() || loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-400 to-cyan-400 rounded-[14px] shadow-[0_0_16px_rgba(96,165,250,0.25)] hover:shadow-[0_0_28px_rgba(96,165,250,0.45)] transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z M12 18v-6m0 0l-3 3m3-3l3 3" />
                </svg>
                Share Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShareModal;
