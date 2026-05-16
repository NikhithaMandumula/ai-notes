import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Features', path: '/features' },
  { label: 'FAQ', path: '/faq' },
];

function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative">
          <div className={`absolute -inset-[1px] bg-gradient-to-r from-blue-400/25 via-cyan-400/20 to-blue-400/25 rounded-[21px] blur-[2px] transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-60'}`} />
          <div className={`relative flex items-center justify-between px-6 py-3.5 rounded-[20px] border border-[var(--border)] transition-all duration-500 ${scrolled ? 'bg-[var(--card-bg)] backdrop-blur-2xl shadow-[0_0_40px_rgba(96,165,250,0.12)]' : 'bg-[rgba(10,10,15,0.5)] backdrop-blur-xl'}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-[0_0_16px_rgba(96,165,250,0.35)] group-hover:shadow-[0_0_24px_rgba(96,165,250,0.5)] transition-all duration-500">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-lg font-bold font-space bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">AI Notes</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm rounded-xl transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'text-[var(--text-primary)] bg-white/8'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Link to="/dashboard" className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 rounded-[14px] shadow-[0_0_20px_rgba(96,165,250,0.25)] hover:shadow-[0_0_30px_rgba(96,165,250,0.45)] transition-all duration-500">
                  Dashboard
                </Link>
              ) : (
                <Link to="/dashboard" className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 rounded-[14px] shadow-[0_0_20px_rgba(96,165,250,0.25)] hover:shadow-[0_0_30px_rgba(96,165,250,0.45)] transition-all duration-500">
                  Get Started
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1">
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400/20 via-cyan-400/15 to-blue-400/20 rounded-[17px] blur-[2px]" />
            <div className="relative bg-[var(--card-bg)] backdrop-blur-2xl rounded-[16px] border border-[var(--border)] p-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 text-sm rounded-xl transition-all ${
                    location.pathname === link.path
                      ? 'text-[var(--text-primary)] bg-white/8'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-[var(--border)] my-2" />
              {user ? (
                <Link to="/dashboard" className="px-4 py-3 text-sm font-medium text-center text-white bg-gradient-to-r from-blue-400 to-cyan-400 rounded-[14px]">Dashboard</Link>
              ) : (
                <Link to="/dashboard" className="px-4 py-3 text-sm font-medium text-center text-white bg-gradient-to-r from-blue-400 to-cyan-400 rounded-[14px]">Get Started</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default LandingNavbar;
