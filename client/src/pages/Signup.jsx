import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';

const Signup = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { signup: registerUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }

    setLoading(true);
    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      addToast('Registration successful', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Signup failed';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-12">
      <div className="absolute inset-0 -z-10 bg-surface">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px]"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#2036bd 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
        />
      </div>

      <main className="w-full max-w-md px-6 z-10">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="AutoGrade Ai Logo" className="w-20 h-20 mb-5 object-contain rounded-2xl drop-shadow-lg" />
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">AutoGrade Ai</h1>
          <p className="text-on-surface-variant font-medium text-sm text-center">Join the future of academic assessment</p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-2xl atmospheric-shadow">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-1 font-headline">Create Account</h2>
            <p className="text-on-surface-variant text-sm">Start your 14-day free trial today.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-on-surface uppercase tracking-widest" htmlFor="name">Full Name</label>
              <input
                className="w-full px-4 py-3 bg-surface-container-high/50 rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline text-sm transition-all border-none"
                id="name"
                placeholder="Dr. Jane Smith"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-on-surface uppercase tracking-widest" htmlFor="email">Work Email</label>
              <input
                className="w-full px-4 py-3 bg-surface-container-high/50 rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline text-sm transition-all border-none"
                id="email"
                placeholder="professor@university.edu"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-on-surface uppercase tracking-widest" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 pr-12 bg-surface-container-high/50 rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline text-sm transition-all border-none"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-on-surface uppercase tracking-widest" htmlFor="confirmPassword">Confirm Password</label>
              <input
                className="w-full px-4 py-3 bg-surface-container-high/50 rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline text-sm transition-all border-none"
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pt-2">
              <button
                className={`w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 ${loading ? 'opacity-70 pointer-events-none' : 'hover:opacity-90 active:scale-[0.98]'}`}
                type="submit"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line text-lg animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <i className="ri-user-add-line text-lg" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-on-surface-variant">
            Already have an ID and password? <Link to="/login" className="text-primary font-bold hover:underline">Log In</Link>
          </p>
          <p className="text-[11px] text-slate-400">
            By creating an account, you agree to our <Link to="/terms" className="text-slate-600 font-semibold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-slate-600 font-semibold hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
