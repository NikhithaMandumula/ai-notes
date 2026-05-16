import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingLayout from '../components/LandingLayout';

function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const { user } = useAuth();

  const faqs = [
    { question: 'Is AI Notes free to use?', answer: 'Yes, AI Notes is completely free to use. Sign up and start taking smarter notes right away with all features included.' },
    { question: 'How does the AI autocomplete work?', answer: 'As you type, our AI analyzes your current note content and suggests relevant completions in real-time. Ghost text appears inline - press Tab to accept a suggestion or Escape to dismiss it.' },
    { question: 'Can I share notes with other users?', answer: 'You can share any note with another user by entering their email address. They will receive a real-time notification and can accept or dismiss the shared note.' },
    { question: 'Is my data secure?', answer: 'We use JWT-based authentication with bcrypt password hashing to keep your account secure. All API requests are authenticated and authorized, ensuring only you can access your notes.' },
    { question: 'What categories are available?', answer: 'AI Notes comes with built-in categories like Work, Personal, Study, Fitness, Goals, and more. You can also create custom categories, add tags, pin important notes, and mark favorites.' },
    { question: 'Does it work on mobile?', answer: 'AI Notes is fully responsive and works on desktop, tablet, and mobile devices. The interface adapts automatically with a collapsible sidebar and mobile-friendly navigation.' },
  ];

  return (
    <LandingLayout>
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">FAQ</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-space mt-4 mb-6">
            <span className="text-[var(--text-primary)]">Frequently Asked </span>
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Questions</span>
          </h2>
        </div>

        <div className="space-y-3 mb-16">
          {faqs.map((faq, i) => (
            <div key={i} className="relative group">
              <div className={`absolute -inset-[1px] bg-gradient-to-r from-blue-400/0 to-cyan-400/0 rounded-[17px] blur-[1px] transition-all duration-500 ${openIndex === i ? 'from-blue-400/20 to-cyan-400/10' : 'group-hover:from-blue-400/10 group-hover:to-cyan-400/5'}`} />
              <div className="relative bg-[var(--card-bg)] backdrop-blur-xl rounded-[16px] border border-[var(--border)] overflow-hidden transition-all duration-500 hover:border-blue-400/20">
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="text-sm font-semibold text-[var(--text-primary)] pr-4">{faq.question}</span>
                  <svg className={`w-5 h-5 text-[var(--text-muted)] flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-60' : 'max-h-0'}`}>
                  <p className="px-6 pb-5 text-sm text-[var(--text-muted)] leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400/30 via-cyan-400/25 to-blue-400/30 rounded-[25px] blur-[2px]" />
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/8 via-cyan-500/8 to-blue-500/8 rounded-[32px] blur-2xl" />
          <div className="relative bg-[var(--card-bg)] backdrop-blur-2xl rounded-[24px] border border-[var(--border)] p-10 sm:p-14 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-space mb-5">
              <span className="text-[var(--text-primary)]">Ready to Write </span>
              <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Smarter?</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-lg mx-auto mb-8 text-base leading-relaxed">
              Join and experience the future of note-taking with AI-powered intelligence.
            </p>
            <Link to="/dashboard" className="group relative inline-flex items-center gap-2.5 px-10 py-4 text-base font-semibold text-white rounded-[16px] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 rounded-[16px] shadow-[0_0_30px_rgba(96,165,250,0.3)] group-hover:shadow-[0_0_50px_rgba(96,165,250,0.5)] transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 rounded-[16px] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <span className="relative">{user ? 'Go to Dashboard' : 'Get Started'}</span>
              <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}

export default FAQPage;
