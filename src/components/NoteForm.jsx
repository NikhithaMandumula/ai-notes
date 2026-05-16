import { useState, useEffect, useRef } from 'react';
import TipTapEditor from './TipTapEditor';
import { generateSummary } from '../services/api';
import { stripHtml } from '../utils/helpers';

function NoteForm({
  onSave,
  onCancel,
  onAutoSave,
  initialTitle = '',
  initialBody = '',
  initialFolder = '',
  initialTags = [],
  folders = [],
  heading = 'New Note',
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [folder, setFolder] = useState(initialFolder);
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [addedFolders, setAddedFolders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [copied, setCopied] = useState(false);
  const autoSaveTimerRef = useRef(null);

  const isEditing = !!initialTitle;

  // Auto-save for editing
  useEffect(() => {
    if (!isEditing || !onAutoSave) return;
    if (title === initialTitle && body === initialBody && folder === initialFolder && JSON.stringify(tags) === JSON.stringify(initialTags)) return;

    setAutoSaveStatus('');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      if (!title.trim()) return;
      setAutoSaveStatus('saving');
      try {
        await onAutoSave({ title: title.trim(), body: body.trim(), folder, tags });
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch {
        setAutoSaveStatus('');
      }
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, body, folder, tags]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ title: title.trim(), body: body.trim(), folder, tags });
    } catch (err) {
      setError(err.message || 'Failed to save note');
      setSaving(false);
    }
  };

  const addTag = (value) => {
    const newTag = value.trim().replace(/,/g, '');
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
  };

  const handleAddFolder = () => {
    const name = newFolder.trim();
    if (name) {
      setFolder(name);
      if (!folders.includes(name) && !addedFolders.includes(name)) {
        setAddedFolders((prev) => [...prev, name]);
      }
      setNewFolder('');
      setShowNewFolder(false);
    }
  };

  const allFolders = [...new Set([...folders, ...addedFolders])];

  const handleGenerateSummary = async () => {
    const plainText = stripHtml(body).trim();
    if (!plainText) {
      setSummaryError('Please write some content before generating a summary.');
      return;
    }
    if (plainText.length < 20) {
      setSummaryError('Content is too short to summarize. Please write more.');
      return;
    }
    setSummaryLoading(true);
    setSummaryError('');
    setSummary('');
    try {
      const data = await generateSummary(plainText);
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err.message || 'Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCopySummary = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(summary);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSummaryError('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-md flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="relative bg-[var(--modal-bg)] backdrop-blur-2xl border border-blue-400/50 rounded-[20px] shadow-[0_0_60px_rgba(96,165,250,0.25),0_16px_48px_rgba(0,0,0,0.2)] w-full max-w-lg p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-geist tracking-tight text-[var(--text-primary)]">{heading}</h2>
          {autoSaveStatus === 'saving' && (
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <div className="h-3 w-3 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              Auto-saving...
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="text-xs text-green-400">Saved</span>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl py-3 px-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Title</label>
          <input
            type="text"
            placeholder="Give your note a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 bg-[var(--input-bg)] border border-blue-400/35 rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/30 focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500"
          />
        </div>

        {/* Content — TipTap Editor with AI autocomplete */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Content</label>
            <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
              Tab to accept AI suggestions
            </span>
          </div>
          <div className="w-full bg-[var(--input-bg)] border border-blue-400/35 rounded-[14px] text-[var(--text-primary)] focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:border-blue-400/50 focus-within:shadow-[0_0_20px_rgba(96,165,250,0.25)] transition-all duration-500 overflow-hidden">
            <TipTapEditor
              content={body}
              onUpdate={(text) => setBody(text)}
              title={title}
              className="min-h-[150px] px-4 py-3 text-sm font-mono"
              placeholder="Write your thoughts..."
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              {stripHtml(body).length} character{stripHtml(body).length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/40 rounded-lg hover:bg-cyan-400/20 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {summaryLoading ? (
                <>
                  <div className="h-3 w-3 border border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Summarize with AI
                </>
              )}
            </button>
          </div>

          {/* Summary error */}
          {summaryError && (
            <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl py-2 px-3 text-xs text-yellow-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {summaryError}
            </div>
          )}

          {/* Summary card */}
          {summary && (
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-cyan-400/40 rounded-xl p-4 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Summary
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-cyan-400 hover:bg-cyan-400/10 transition-all duration-200"
                    title="Copy summary"
                  >
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-cyan-400 hover:bg-cyan-400/10 transition-all duration-200 disabled:opacity-40"
                    title="Regenerate"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${summaryLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{summary}</p>
              <button
                type="button"
                onClick={() => { setBody(`<p>${summary}</p>`); setSummary(''); }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:shadow-[0_0_16px_rgba(34,211,238,0.3)] transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Replace Note with Summary
              </button>
            </div>
          )}
        </div>

        {/* Folder */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Folder</label>
          {showNewFolder ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New folder name..."
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFolder())}
                className="flex-1 px-4 py-2.5 bg-[var(--input-bg)] border border-blue-400/35 rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500"
              />
              <button type="button" onClick={handleAddFolder} className="px-3 py-2.5 bg-blue-400/20 text-blue-300 rounded-[14px] text-sm hover:bg-blue-500/30 transition-all duration-300">Add</button>
              <button type="button" onClick={() => setShowNewFolder(false)} className="px-3 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-all duration-300">Cancel</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[var(--input-bg)] border border-blue-400/35 rounded-[14px] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] transition-all duration-500"
              >
                <option value="">Uncategorized</option>
                {allFolders.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewFolder(true)}
                className="px-3 py-2.5 bg-[var(--surface)] border border-blue-400/35 rounded-[14px] text-[var(--text-secondary)] hover:text-blue-300 text-sm transition-all duration-300"
              >
                + New
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Tags</label>
          <div className="flex flex-wrap gap-1.5 p-3 bg-[var(--input-bg)] border border-blue-400/35 rounded-[14px] min-h-[44px] focus-within:ring-2 focus-within:ring-blue-400/40 focus-within:shadow-[0_0_16px_rgba(96,165,250,0.15)] transition-all duration-500">
            {tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-400/20 text-blue-300">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))} className="hover:text-red-400 ml-0.5">&times;</button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder={tags.length === 0 ? 'Add tags (press Enter)...' : ''}
              className="flex-1 min-w-[100px] bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[14px] hover:bg-[var(--surface)] transition-all duration-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-400 to-cyan-400 rounded-[14px] shadow-[0_0_16px_rgba(96,165,250,0.25)] hover:shadow-[0_0_28px_rgba(96,165,250,0.45)] transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Note'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoteForm;
