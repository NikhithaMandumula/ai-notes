import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup as signupApi } from '../services/api';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-emerald-500'];

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signupApi(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) =>
    show ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10 overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold font-space tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              AI Notes
            </span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-2">Create your account to get started</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-400/35 via-blue-400/35 to-blue-400/30 rounded-[21px] blur-[2px]" />
          <div className="relative bg-[var(--card-bg)] backdrop-blur-2xl rounded-[20px] shadow-[0_0_50px_rgba(96,165,250,0.15),0_16px_48px_rgba(0,0,0,0.15)] p-8">
            {error && (
              <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-[14px] py-3 px-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                  <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required className="relative w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                  <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="relative w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 pr-12 bg-[var(--input-bg)] border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                </div>
                {password && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= level ? strengthColors[strength] : 'bg-[var(--border)]'}`} />
                      ))}
                    </div>
                    <span className={`text-xs ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-orange-400' : strength === 3 ? 'text-blue-300' : 'text-emerald-400'}`}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={`w-full px-4 py-3 pr-12 bg-[var(--input-bg)] border rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${confirmPassword && confirmPassword !== password ? 'border-red-500/50' : 'border-[var(--border)]'}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                      <EyeIcon show={showConfirmPassword} />
                    </button>
                  </div>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <span className="text-xs text-red-400">Passwords do not match</span>
                )}
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 rounded-[14px] shadow-[0_0_20px_rgba(96,165,250,0.25)] hover:shadow-[0_0_30px_rgba(96,165,250,0.45)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-medium hover:from-cyan-300 hover:to-blue-300 transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
