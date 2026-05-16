import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFileForNotes, generateNotesFromYouTube } from '../services/api';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function UploadIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function YouTubeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
    </svg>
  );
}

function FileIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function ResourcePanel({ onNotesGenerated, isOpen, onToggle, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'upload');
  const [file, setFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const validateFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Unsupported file type. Please upload PDF, DOCX, PPTX, or TXT.');
      return false;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit.');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileSelect = (f) => {
    if (validateFile(f)) {
      setFile(f);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const selected = e.target.files[0];
    if (selected) handleFileSelect(selected);
    e.target.value = '';
  };

  const isValidYoutubeUrl = (url) => {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/.test(url);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'upload' && file) {
        setProgress('Uploading & extracting text...');
        const notes = await uploadFileForNotes(file);
        setProgress('');
        onNotesGenerated(notes);
        setFile(null);
      } else if (activeTab === 'youtube' && youtubeUrl) {
        setProgress('Fetching transcript...');
        const notes = await generateNotesFromYouTube(youtubeUrl);
        setProgress('');
        onNotesGenerated(notes);
        setYoutubeUrl('');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate notes. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const canGenerate = (activeTab === 'upload' && file) || (activeTab === 'youtube' && isValidYoutubeUrl(youtubeUrl));

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full lg:w-96 flex-shrink-0 lg:sticky lg:top-20 lg:self-start"
    >
      <div className="bg-[var(--card-bg)]/80 backdrop-blur-2xl border-2 border-slate-400/80 rounded-2xl shadow-[0_0_40px_rgba(96,165,250,0.08)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-lg">
              <SparklesIcon className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Note from Resources</h3>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex gap-1 p-1 bg-[var(--input-bg)] rounded-xl">
            <button
              type="button"
              onClick={() => { setActiveTab('upload'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-[0_0_12px_rgba(96,165,250,0.3)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <UploadIcon className="h-3.5 w-3.5" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('youtube'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'youtube'
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-[0_0_12px_rgba(96,165,250,0.3)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <YouTubeIcon className="h-3.5 w-3.5" />
              YouTube Link
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5 py-3">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Drop Zone */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    dragOver
                      ? 'border-blue-400/60 bg-blue-400/5 shadow-[0_0_20px_rgba(96,165,250,0.15)]'
                      : 'border-[var(--border)] hover:border-blue-400/30 hover:bg-blue-400/[0.02]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.pptx,.txt"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
                      dragOver ? 'bg-blue-400/20' : 'bg-[var(--input-bg)]'
                    }`}>
                      <UploadIcon className={`h-6 w-6 transition-colors duration-300 ${
                        dragOver ? 'text-blue-400' : 'text-[var(--text-muted)]'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        PDF, DOCX, PPTX, TXT (max 10MB)
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* File Badge */}
                <AnimatePresence>
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg">
                        <FileIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--text-primary)] truncate">{file.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); setError(''); }}
                          className="p-1 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <CloseIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'youtube' && (
              <motion.div
                key="youtube"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <YouTubeIcon className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => { setYoutubeUrl(e.target.value); setError(''); }}
                    placeholder="Paste YouTube URL..."
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/40 transition-all"
                  />
                  {youtubeUrl && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidYoutubeUrl(youtubeUrl) ? (
                        <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-2 pl-1">
                  Supports youtube.com and youtu.be links
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5"
            >
              <div className="flex items-start gap-2 px-3 py-2 bg-red-400/10 border border-red-400/20 rounded-lg mb-3">
                <svg className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[11px] text-red-300">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <div className="px-5 pb-5 pt-1">
          <motion.button
            type="button"
            whileHover={canGenerate && !loading ? { scale: 1.02 } : {}}
            whileTap={canGenerate && !loading ? { scale: 0.98 } : {}}
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl shadow-[0_0_16px_rgba(96,165,250,0.25)] hover:shadow-[0_0_28px_rgba(96,165,250,0.45)] transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1">
                  {[0, 0.15, 0.3].map((delay) => (
                    <motion.div
                      key={delay}
                      className="h-1.5 w-1.5 bg-white rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
                <span className="text-xs">{progress || 'Generating notes...'}</span>
              </div>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Generate Notes
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
