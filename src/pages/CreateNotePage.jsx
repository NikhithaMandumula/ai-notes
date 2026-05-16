import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TipTapEditor from '../components/TipTapEditor';
import ResourcePanel from '../components/ResourcePanel';
import { createNote, fetchFolders, generateSummary } from '../services/api';
import { mergeCategories, stripHtml } from '../utils/helpers';

function CreateNotePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [folder, setFolder] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [folders, setFolders] = useState([]);
  const [hiddenCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hiddenCategories') || '[]'); } catch { return []; }
  });

  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [copied, setCopied] = useState(false);

  const [resourcePanelOpen, setResourcePanelOpen] = useState(true);
  const [resourcePanelTab, setResourcePanelTab] = useState('upload');

  const allFolders = mergeCategories(folders, hiddenCategories);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const f = await fetchFolders();
        setFolders(f);
      } catch {
        // Non-critical
      }
    };
    loadMeta();
  }, []);

  // Warn before leaving with unsaved content
  useEffect(() => {
    const hasContent = title.trim() || stripHtml(body).trim();
    const handleBeforeUnload = (e) => {
      if (hasContent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, body]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createNote({ title: title.trim(), body: body.trim(), folder, tags });
      navigate('/dashboard');
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
      if (!folders.includes(name)) {
        setFolders((prev) => [...prev, name]);
      }
      setNewFolder('');
      setShowNewFolder(false);
    }
  };

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

  const handleNotesGenerated = (notes) => {
    if (stripHtml(body).trim()) {
      setBody(body + '<hr>' + notes);
    } else {
      setBody(notes);
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Minimal top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-[var(--surface)]/80 backdrop-blur-2xl border-b border-[var(--border)]">
        <div className="flex items-center justify-between h-full px-4 lg:px-8 max-w-7xl mx-auto">
          {/* Back */}
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </motion.button>

          {/* Center label */}
          <span className="text-sm font-semibold font-geist text-[var(--text-primary)]">New Note</span>

          {/* Right: char count */}
          <span className="text-xs text-[var(--text-muted)] tabular-nums">
            {stripHtml(body).length} char{stripHtml(body).length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Main content — two-column layout */}
      <main className="pt-14 pb-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto py-8 flex flex-col lg:flex-row gap-6">

          {/* Left column: Editor */}
          <motion.form
            id="create-note-form"
            onSubmit={handleSave}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex-1 min-w-0"
          >
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/40 rounded-xl py-3 px-4 text-sm text-red-400 mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* Single editor card */}
            <div className="bg-[var(--card-bg)]/80 backdrop-blur-2xl border-2 border-slate-400/80 rounded-2xl shadow-[0_0_40px_rgba(96,165,250,0.12)] overflow-hidden flex flex-col">

              {/* Title */}
              <input
                type="text"
                placeholder="Untitled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="w-full text-2xl lg:text-3xl font-bold font-geist text-[var(--text-primary)] placeholder-[var(--text-muted)]/40 bg-transparent border-none focus:outline-none px-6 pt-6 pb-4"
              />

              {/* Divider */}
              <div className="h-px bg-[var(--border)] mx-6" />

              {/* TipTap Rich Text Editor */}
              <div className="flex flex-col gap-2 px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
                    Tab to accept AI suggestions
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">Rich text editor</span>
                </div>
                <div className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] focus-within:ring-2 focus-within:ring-blue-400/30 focus-within:border-blue-400/40 focus-within:shadow-[0_0_20px_rgba(96,165,250,0.15)] transition-all duration-500 overflow-hidden">
                  <TipTapEditor
                    content={body}
                    onUpdate={(text) => setBody(text)}
                    title={title}
                    className="min-h-[50vh] px-5 py-4 text-base"
                    placeholder="Write your thoughts..."
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--border)] mx-6" />

              {/* Summarize with AI */}
              <div className="flex flex-col gap-3 px-6 py-4">
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                  className="self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/40 rounded-lg hover:bg-cyan-400/20 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
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

                {summaryError && (
                  <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl py-2 px-3 text-xs text-yellow-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {summaryError}
                  </div>
                )}

                {summary && (
                  <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-cyan-400/30 rounded-xl p-4">
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

              {/* Divider */}
              <div className="h-px bg-[var(--border)] mx-6" />

              {/* Folder & Tags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-6 py-5">
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
                        className="flex-1 px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-400/40 text-sm transition-all duration-500"
                      />
                      <button type="button" onClick={handleAddFolder} className="px-3 py-2.5 bg-blue-400/20 text-blue-300 rounded-xl text-sm hover:bg-blue-500/30 transition-all duration-300">Add</button>
                      <button type="button" onClick={() => setShowNewFolder(false)} className="px-3 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-all duration-300">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all duration-500"
                      >
                        <option value="">Uncategorized</option>
                        {allFolders.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewFolder(true)}
                        className="px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:text-blue-300 text-sm transition-all duration-300"
                      >
                        + New
                      </button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Tags</label>
                  <div className="flex flex-wrap gap-1.5 p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl min-h-[44px] focus-within:ring-2 focus-within:ring-blue-400/40 transition-all duration-500">
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
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--border)] mx-6" />

              {/* Save Button */}
              <div className="px-6 py-5">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!title.trim() || saving}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-xl shadow-[0_0_24px_rgba(96,165,250,0.4)] hover:shadow-[0_0_36px_rgba(96,165,250,0.6)] hover:brightness-110 transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Note
                    </>
                  )}
                </motion.button>
              </div>

            </div>{/* End single editor card */}
          </motion.form>

          {/* Right column: Resource Panel */}
          <AnimatePresence>
            {resourcePanelOpen && (
              <ResourcePanel
                onNotesGenerated={handleNotesGenerated}
                isOpen={resourcePanelOpen}
                onToggle={() => setResourcePanelOpen(false)}
                initialTab={resourcePanelTab}
              />
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Mobile toggle button for resource panel */}
      <AnimatePresence>
        {!resourcePanelOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setResourcePanelOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-3.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.4)] text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
              <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CreateNotePage;
