import LandingLayout from '../components/LandingLayout';

function FeaturesPage() {
  const features = [
    { title: 'AI Autocomplete', description: 'Ghost text suggestions appear as you type, powered by advanced AI. Press Tab to accept.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>, color: 'blue' },
    { title: 'Real-time Sharing', description: 'Share notes with others instantly via Socket.IO. Get notified when someone shares with you.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>, color: 'cyan' },
    { title: 'Smart Organization', description: 'Folders, categories, tags, favorites, and pinned notes keep everything at your fingertips.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>, color: 'indigo' },
    { title: 'Rich Text Editor', description: 'TipTap-powered editor with markdown support, formatting toolbar, and character count.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>, color: 'purple' },
    { title: 'Dark & Light Mode', description: 'Switch between dark and light themes with a beautiful transition. Preference is remembered.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>, color: 'amber' },
    { title: 'Auto-Save', description: 'Notes save automatically as you type with smart debouncing. Never lose your work.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>, color: 'emerald' },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/15', text: 'text-blue-300', glow: 'group-hover:shadow-[0_0_24px_rgba(59,130,246,0.15)]' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/15', text: 'text-cyan-300', glow: 'group-hover:shadow-[0_0_24px_rgba(6,182,212,0.15)]' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/15', text: 'text-indigo-300', glow: 'group-hover:shadow-[0_0_24px_rgba(99,102,241,0.15)]' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/15', text: 'text-purple-300', glow: 'group-hover:shadow-[0_0_24px_rgba(168,85,247,0.15)]' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/15', text: 'text-amber-300', glow: 'group-hover:shadow-[0_0_24px_rgba(245,158,11,0.15)]' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', text: 'text-emerald-300', glow: 'group-hover:shadow-[0_0_24px_rgba(16,185,129,0.15)]' },
  };

  return (
    <LandingLayout>
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-space mt-4 mb-6">
            <span className="text-[var(--text-primary)]">Everything You </span>
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Need</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg">
            Powerful features designed to make note-taking effortless and intelligent.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const c = colorMap[feature.color];
            return (
              <div key={feature.title} className="relative group h-full">
                <div className="absolute -inset-[1px] bg-gradient-to-b from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/15 group-hover:to-cyan-400/8 rounded-[21px] blur-[1px] transition-all duration-500" />
                <div className={`relative h-full bg-[var(--card-bg)] backdrop-blur-xl rounded-[20px] border border-[var(--border)] p-7 hover:border-blue-400/25 transition-all duration-500 ${c.glow}`}>
                  <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} mb-5`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold font-space text-[var(--text-primary)] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LandingLayout>
  );
}

export default FeaturesPage;
