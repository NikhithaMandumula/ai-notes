import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';

function LoginPage() {
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginApi(email, password);
      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 relative z-10 overflow-hidden">
      <div className="w-full max-w-[90%] sm:max-w-md relative z-10">
        <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-space tracking-tight">
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              AI Notes
            </span>
          </h1>
          <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-2">Welcome back! Sign in to your account</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400/35 via-cyan-400/30 to-blue-400/35 rounded-[21px] blur-[2px]" />
          <div className="relative bg-[var(--card-bg)] backdrop-blur-2xl rounded-[20px] shadow-[0_0_50px_rgba(96,165,250,0.15),0_16px_48px_rgba(0,0,0,0.15)] p-5 sm:p-8 pt-4 sm:pt-6">
            <button
              onClick={() => navigate('/')}
              className="mb-3 sm:mb-4 p-1.5 sm:p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {verified === 'true' && (
              <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-[14px] py-3 px-4 text-sm text-emerald-400">
                Email verified successfully! You can now sign in.
              </div>
            )}
            {verified === 'error' && (
              <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-[14px] py-3 px-4 text-sm text-red-400">
                Verification link is invalid or expired. Please sign up again.
              </div>
            )}
            {error && (
              <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-[14px] py-3 px-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-cyan-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="relative w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-12 bg-[var(--input-bg)] border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--input-bg)] text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-300 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-400 via-blue-400 to-cyan-400 rounded-[14px] shadow-[0_0_20px_rgba(96,165,250,0.25)] hover:shadow-[0_0_30px_rgba(96,165,250,0.45)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-[var(--text-muted)] mt-4 sm:mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent font-medium hover:from-blue-300 hover:to-cyan-300 transition-all">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
