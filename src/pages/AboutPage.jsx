import LandingLayout from '../components/LandingLayout';

function AboutPage() {
  return (
    <LandingLayout>
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">About</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-space mt-4 mb-6">
            <span className="text-[var(--text-primary)]">Built for </span>
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Modern Thinkers</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg leading-relaxed">
            AI Notes combines the simplicity of a notepad with the power of artificial intelligence, helping you capture and organize thoughts effortlessly.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-14">
          {[
            { value: 'AI', label: 'Smart Autocomplete' },
            { value: '100%', label: 'Free to Use' },
            { value: 'Real-time', label: 'Collaboration' },
            { value: 'Secure', label: 'End-to-End' },
          ].map((stat) => (
            <div key={stat.label} className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-blue-400/20 to-cyan-400/10 rounded-[21px] blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-[var(--card-bg)] backdrop-blur-xl rounded-[20px] border border-[var(--border)] p-6 sm:p-8 text-center hover:border-blue-400/30 transition-all duration-500">
                <div className="text-2xl sm:text-3xl font-extrabold font-space bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Why AI Notes */}
        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400/15 via-cyan-400/10 to-blue-400/15 rounded-[25px] blur-[2px]" />
          <div className="relative bg-[var(--card-bg)] backdrop-blur-2xl rounded-[24px] border border-[var(--border)] p-8 sm:p-12 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold font-space text-[var(--text-primary)] mb-4">Why AI Notes?</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                Traditional note apps store text. AI Notes understands your writing, suggests what comes next, and helps you organize information intelligently. Write faster, think clearer, and never lose an idea.
              </p>
              <ul className="space-y-3">
                {['AI-powered ghost text suggestions', 'Real-time collaborative sharing', 'Smart categorization & tags', 'Secure authentication & data'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/15 to-cyan-500/10 rounded-[20px] blur-xl" />
              <div className="relative bg-[var(--surface)] rounded-[16px] border border-[var(--border)] p-6 space-y-4">
                {[
                  { icon: '📝', title: 'Smart Notes', desc: 'Create notes with AI assistance' },
                  { icon: '🔗', title: 'Share Instantly', desc: 'Collaborate in real-time' },
                  { icon: '📂', title: 'Organized', desc: 'Folders, tags, and categories' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors duration-300">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}

export default AboutPage;
