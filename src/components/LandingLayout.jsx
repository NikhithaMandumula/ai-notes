import { Link } from 'react-router-dom';
import LandingNavbar from './LandingNavbar';

const FOOTER_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Features', path: '/features' },
  { label: 'FAQ', path: '/faq' },
];

function LandingLayout({ children }) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-6">
        {children}
      </main>
      <footer className="relative border-t border-[var(--border)] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-sm font-semibold font-space bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">AI Notes</span>
          </Link>
          <p className="text-xs text-[var(--text-muted)]">Built with React, TipTap, and AI</p>
          <div className="flex items-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.path} to={link.path} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingLayout;
