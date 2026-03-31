import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1324] font-body text-on-surface overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="glow-blob w-[500px] h-[500px] bg-primary-container -top-40 -left-40" />
        <div className="glow-blob w-[400px] h-[400px] bg-tertiary -bottom-20 -right-20" />
        <div className="glow-blob w-[300px] h-[300px] bg-secondary-container top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <main className="relative z-10 min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
        <div className="layout-container w-full max-w-[1200px] flex flex-col items-center">
          <div className="glass-card w-full max-w-[400px] sm:max-w-[450px] rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            {/* Branding Header */}
            <div className="flex flex-col items-center gap-3 mb-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    clipRule="evenodd"
                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="font-headline text-lg sm:text-xl font-bold tracking-tight text-white">
                IntelliTutor AI
              </h1>
            </div>

            <div className="flex flex-col gap-1 mb-3 sm:mb-4 text-center">
              <span className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">
                Neural Gateway
              </span>
              <h2 className="font-headline text-xl sm:text-2xl font-black text-white leading-tight">
                Create Profile
              </h2>
              <p className="text-on-surface-variant text-xs sm:text-sm">
                Initialize your neural learning journey
              </p>
            </div>

            <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-surface-variant ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-lg" data-icon="person">person</span>
                  </div>
                  <input
                    className="w-full h-10 sm:h-12 bg-surface-container-low/50 border-b border-outline-variant focus:border-primary text-white placeholder:text-outline transition-all duration-300 outline-none rounded-md pl-12 pr-4 text-sm"
                    placeholder="Enter your full name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-surface-variant ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-lg" data-icon="mail">mail</span>
                  </div>
                  <input
                    className="w-full h-10 sm:h-12 bg-surface-container-low/50 border-b border-outline-variant focus:border-primary text-white placeholder:text-outline transition-all duration-300 outline-none rounded-md pl-12 pr-4 text-sm"
                    placeholder="name@nexus.ai"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-surface-variant ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-lg" data-icon="lock">lock</span>
                  </div>
                  <input
                    className="w-full h-10 sm:h-12 bg-surface-container-low/50 border-b border-outline-variant focus:border-primary text-white placeholder:text-outline transition-all duration-300 outline-none rounded-md pl-12 pr-4 text-sm"
                    placeholder="••••••••"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-surface-variant ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-lg" data-icon="lock">lock</span>
                  </div>
                  <input
                    className="w-full h-10 sm:h-12 bg-surface-container-low/50 border-b border-outline-variant focus:border-primary text-white placeholder:text-outline transition-all duration-300 outline-none rounded-md pl-12 pr-4 text-sm"
                    placeholder="••••••••"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* CTA Button */}
              <button
                className="primary-gradient w-full h-10 sm:h-12 rounded-xl font-headline font-bold text-on-primary tracking-wide text-sm sm:text-base shadow-[0_0_20px_rgba(128,131,255,0.3)] hover:shadow-[0_0_30px_rgba(128,131,255,0.5)] transition-all duration-500 relative group overflow-hidden mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Creating account...' : 'Create Account'}
                  <span className="material-symbols-outlined" data-icon="person_add">person_add</span>
                </span>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform" />
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </form>

            <div className="mt-4 text-center">
              <button
                className="text-primary font-bold hover:underline decoration-tertiary underline-offset-4 text-xs sm:text-sm"
                type="button"
                onClick={() => navigate('/')}
              >
                ← Back to Home
              </button>
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-on-surface-variant text-sm">
                Already have an account? 
                <button
                  className="text-primary font-bold ml-1 hover:underline decoration-tertiary underline-offset-4 text-xs sm:text-sm"
                  type="button"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
