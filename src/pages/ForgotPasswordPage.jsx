import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/api';

function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'done'
  const [email, setEmail] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, enteredCode, newPassword);
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10 overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold font-space tracking-tight">
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
              AI Notes
            </span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-2">
            {step === 'email' && 'Enter your email to reset your password'}
            {step === 'code' && 'Enter the reset code and your new password'}
            {step === 'done' && 'Your password has been reset'}
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400/35 via-cyan-400/30 to-blue-400/35 rounded-[21px] blur-[2px]" />
          <div className="relative bg-[var(--card-bg)] backdrop-blur-2xl rounded-[20px] shadow-[0_0_50px_rgba(96,165,250,0.15),0_16px_48px_rgba(0,0,0,0.15)] p-8">
            {error && (
              <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-[14px] py-3 px-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Step 1: Enter email */}
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Email</label>
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-cyan-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="relative w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-400 via-blue-400 to-cyan-400 rounded-[14px] shadow-[0_0_20px_rgba(96,165,250,0.25)] hover:shadow-[0_0_30px_rgba(96,165,250,0.45)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Get Reset Code'
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Show code + enter new password */}
            {step === 'code' && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                {/* Check email message */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-[14px] py-4 px-5 text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-blue-400/25 flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">OTP sent to <span className="text-blue-300 font-medium">{email}</span></p>
                  <p className="text-xs text-[var(--text-muted)]">Code expires in 5 minutes</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Enter OTP</label>
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-cyan-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="relative w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500 tracking-[0.3em] text-center font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">New Password</label>
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 bg-[var(--input-bg)] border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-400/35 group-focus-within:via-cyan-400/35 group-focus-within:to-blue-400/35 rounded-[15px] transition-all duration-500 blur-[1px]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`relative w-full px-4 py-3 bg-[var(--input-bg)] border rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500 ${
                        confirmPassword && confirmPassword !== newPassword ? 'border-red-500/50' : 'border-[var(--border)]'
                      }`}
                    />
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <span className="text-xs text-red-400">Passwords do not match</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-400 via-blue-400 to-cyan-400 rounded-[14px] shadow-[0_0_20px_rgba(96,165,250,0.25)] hover:shadow-[0_0_30px_rgba(96,165,250,0.45)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <button type="button" onClick={() => { setStep('email'); setError(''); setEnteredCode(''); }} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-center">
                  Use a different email
                </button>
              </form>
            )}

            {/* Step 3: Success */}
            {step === 'done' && (
              <div className="flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-sm text-[var(--text-secondary)] text-center">Your password has been reset successfully. You can now sign in with your new password.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-400 via-blue-400 to-cyan-400 rounded-[14px] shadow-[0_0_20px_rgba(96,165,250,0.25)] hover:shadow-[0_0_30px_rgba(96,165,250,0.45)] transition-all duration-500"
                >
                  Go to Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Remember your password?{' '}
          <Link to="/login" className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent font-medium transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
