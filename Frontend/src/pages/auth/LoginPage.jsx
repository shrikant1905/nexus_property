import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield, Eye, EyeOff, Wrench, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      // Navigate based on real role returned from backend
      if (user.roleKey === 'maintenance-staff') {
        navigate('/maintenance/my-tasks', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-between p-4 relative overflow-hidden select-none">

      {/* Background subtle glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(0,32,74,0.06) 0%, transparent 65%)' }}
      />

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center w-full z-10 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-[460px] bg-white border border-slate-200 rounded-[28px] p-8 sm:p-9 shadow-[0_20px_50px_rgba(0,32,74,0.08)]"
        >

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-16 h-16 rounded-2xl bg-[#00204a] flex items-center justify-center shadow-[0_12px_30px_rgba(0,32,74,0.25)]"
            >
              <span className="text-white font-black text-sm tracking-tighter">NEXUS</span>
            </motion.div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="text-center mb-8"
          >
            <h1 className="text-[26px] sm:text-[28px] font-black text-[#00204a] tracking-tight leading-tight">
              Welcome to Nexus FMS
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium leading-relaxed">
              Facility Management System · Sign in to continue
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.24 }}
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >
            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                  role="alert"
                >
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs font-semibold text-red-700 leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00204a] transition-colors" size={17} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="admin@nexusfms.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white focus:ring-1 focus:ring-[#00204a]/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00204a] transition-colors" size={17} />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white focus:ring-1 focus:ring-[#00204a]/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <motion.button
              whileHover={!loading ? { scale: 1.015, boxShadow: '0 8px 24px rgba(0,32,74,0.3)' } : {}}
              whileTap={!loading ? { scale: 0.985 } : {}}
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="w-full py-4 px-6 rounded-xl font-bold text-white text-sm bg-[#00204a] hover:bg-[#001738] shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 tracking-wide mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Signing In…
                </>
              ) : (
                <>
                  Sign In to Nexus FMS
                  <ArrowRight size={17} />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Quick Select Role Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mt-7 space-y-2"
          >
            <p className="text-[11px] font-bold text-slate-500 text-center">Click a role below to auto-fill seed login credentials:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@nexusfms.com');
                  setPassword('Password123!');
                  setError('');
                }}
                className="flex items-center gap-2.5 bg-[#00204a]/5 hover:bg-[#00204a]/10 border border-[#00204a]/15 rounded-xl px-3.5 py-3 transition-all cursor-pointer text-left"
              >
                <Shield size={16} className="text-[#00204a] shrink-0" />
                <div>
                  <p className="text-[11px] font-extrabold text-[#00204a]">Office Admin</p>
                  <p className="text-[10px] text-slate-500 font-medium">admin@nexusfms.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('staff@nexusfms.com');
                  setPassword('Password123!');
                  setError('');
                }}
                className="flex items-center gap-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-3 transition-all cursor-pointer text-left"
              >
                <Wrench size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[11px] font-extrabold text-emerald-700">Maintenance Staff</p>
                  <p className="text-[10px] text-slate-500 font-medium">staff@nexusfms.com</p>
                </div>
              </button>
            </div>
          </motion.div>


        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center text-slate-500 text-xs py-4 z-10 font-medium">
        © 2026 Nexus FMS · Facility Management System · nexusfms.com
      </footer>
    </div>
  );
}

