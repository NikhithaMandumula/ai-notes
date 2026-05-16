import { motion } from 'framer-motion';

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

export default function QuickAddCards({ onUploadClick, onYouTubeClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <motion.button
        type="button"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onUploadClick}
        className="flex items-center gap-3 p-3.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl hover:border-blue-400/40 hover:shadow-[0_0_16px_rgba(96,165,250,0.12)] transition-all duration-300 cursor-pointer text-left"
      >
        <div className="p-2 bg-blue-400/10 rounded-lg flex-shrink-0">
          <UploadIcon className="h-4 w-4 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--text-primary)]">Upload File</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">PDF, DOCX, PPTX, TXT</p>
        </div>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onYouTubeClick}
        className="flex items-center gap-3 p-3.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl hover:border-red-400/40 hover:shadow-[0_0_16px_rgba(248,113,113,0.12)] transition-all duration-300 cursor-pointer text-left"
      >
        <div className="p-2 bg-red-400/10 rounded-lg flex-shrink-0">
          <YouTubeIcon className="h-4 w-4 text-red-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--text-primary)]">YouTube Video</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Generate notes from video</p>
        </div>
      </motion.button>
    </div>
  );
}
