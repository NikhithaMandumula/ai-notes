import LandingLayout from '../components/LandingLayout';

function HowItWorksPage() {
  const steps = [
    { step: '01', title: 'Sign Up', description: 'Create your free account in seconds. No credit card required.', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { step: '02', title: 'Create Notes', description: 'Start writing notes with a rich text editor and AI-powered suggestions.', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { step: '03', title: 'Get AI Suggestions', description: 'As you type, AI suggests completions. Press Tab to accept, Escape to dismiss.', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { step: '04', title: 'Organize & Share', description: 'Use folders, tags, and favorites. Share notes with others in real-time.', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> },
  ];

  return (
    <LandingLayout>
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-space mt-4 mb-6">
            <span className="text-[var(--text-primary)]">Simple to </span>
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Get Started</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg">
            From sign-up to AI-powered productivity in four easy steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.step} className="relative group h-full">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/20 group-hover:to-cyan-400/10 rounded-[21px] blur-[1px] transition-all duration-500" />
              <div className="relative h-full bg-[var(--card-bg)] backdrop-blur-xl rounded-[20px] border border-[var(--border)] p-7 hover:border-blue-400/30 transition-all duration-500 flex flex-col">
                <div className="text-xs font-bold text-blue-400/40 tracking-widest mb-5">{step.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border border-blue-400/15 flex items-center justify-center text-blue-300 mb-5 group-hover:shadow-[0_0_20px_rgba(96,165,250,0.15)] transition-all duration-500">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold font-space text-[var(--text-primary)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LandingLayout>
  );
}

export default HowItWorksPage;
