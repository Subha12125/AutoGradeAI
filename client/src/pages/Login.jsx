import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login: authenticate } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast('Please enter both your email/ID and password', 'error');
      return;
    }
    setLoading(true);
    try {
      await authenticate(email.trim(), password);
      addToast('Login successful', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    addToast('Password reset link sent to your email', 'info');
  };

  const handleRequestAccess = (e) => {
    e.preventDefault();
    addToast('Access request submitted to admin', 'success');
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-surface">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px]"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#2036bd 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
        />
      </div>

      <main className="w-full max-w-md px-6 z-10">
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="AutoGrade Ai Logo" className="w-20 h-20 mb-5 object-contain rounded-2xl drop-shadow-lg" />
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">AutoGrade Ai</h1>
          <p className="text-on-surface-variant font-medium text-sm">Empowering the Academic Edge</p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-2xl atmospheric-shadow">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-1 font-headline">Welcome back</h2>
            <p className="text-on-surface-variant text-sm">Enter your credentials to log in.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-on-surface uppercase tracking-widest" htmlFor="email">
                Email or Faculty ID
              </label>
              <input
                className="w-full px-4 py-3 bg-surface-container-high/50 rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline text-sm transition-all border-none"
                id="email"
                placeholder="professor@university.edu or User ID"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-on-surface uppercase tracking-widest" htmlFor="password">Password</label>
                <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold text-primary hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 pr-12 bg-surface-container-high/50 rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline text-sm transition-all border-none"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <i className={`text-lg ${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-highest" id="remember" type="checkbox" />
              <label className="ml-2 text-sm text-on-surface-variant" htmlFor="remember">Keep me authenticated</label>
            </div>

            <button
              className={`w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 ${loading ? 'opacity-70 pointer-events-none' : 'hover:opacity-90 active:scale-[0.98]'}`}
              type="submit"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line text-lg animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <i className="ri-arrow-right-line text-lg" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-on-surface-variant">
            New to AutoGrade? <Link to="/signup" className="text-primary font-bold hover:underline">Create Account</Link>
          </p>
          <p className="text-[11px] text-slate-400">
            Need help? <Link to="/support" className="text-slate-600 font-semibold hover:underline">Contact Support</Link> • <Link to="/privacy" className="text-slate-600 font-semibold hover:underline">Privacy</Link> • <Link to="/terms" className="text-slate-600 font-semibold hover:underline">Terms</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
