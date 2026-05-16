import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingLayout from '../components/LandingLayout';

function LandingPage() {
  const { user } = useAuth();

  return (
    <LandingLayout>
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl mb-8">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">AI-Powered Note Taking</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-space leading-[1.1] tracking-tight mb-6">
          <span className="text-[var(--text-primary)]">Your Ideas,</span><br />
          <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Supercharged</span><br />
          <span className="text-[var(--text-primary)]">with AI</span>
        </h1>

        <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Capture thoughts, organize ideas, and write faster with intelligent AI autocomplete. The modern notes app built for how you think.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/dashboard" className="group relative px-8 py-4 text-base font-semibold text-white rounded-[16px] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 rounded-[16px] shadow-[0_0_30px_rgba(96,165,250,0.3)] group-hover:shadow-[0_0_50px_rgba(96,165,250,0.5)] transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 rounded-[16px] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <span className="relative flex items-center gap-2">
              Get Started
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </Link>
          <Link to="/how-it-works" className="px-8 py-4 text-base font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-[16px] hover:bg-white/5 hover:text-[var(--text-primary)] hover:border-blue-400/30 transition-all duration-500">
            See How It Works
          </Link>
        </div>

        {/* Hero visual - mock editor */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 rounded-[28px] blur-2xl" />
          <div className="relative bg-[var(--card-bg)] backdrop-blur-2xl rounded-[24px] border border-[var(--border)] p-6 sm:p-8 shadow-[0_0_60px_rgba(96,165,250,0.1)]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1" />
              <div className="px-3 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-muted)]">AI Active</div>
            </div>
            <div className="space-y-4 text-left">
              <div className="h-8 flex items-center">
                <span className="text-xl font-semibold text-[var(--text-primary)] font-space">Project Meeting Notes</span>
              </div>
              <div className="space-y-2.5">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Discussed the Q3 roadmap and assigned priorities for the upcoming sprint.</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">1. Migrate authentication to OAuth 2.0 by end of month</p>
                <p className="text-sm leading-relaxed">
                  <span className="text-[var(--text-secondary)]">2. Schedule user testing for</span>
                  <span className="text-[var(--text-muted)] italic opacity-50"> the new onboarding flow next week</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-medium">TAB to accept</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[var(--border)]">
              <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">Work</div>
              <div className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">Meeting</div>
              <div className="flex-1" />
              <span className="text-xs text-[var(--text-muted)]">Auto-saved</span>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}

export default LandingPage;
