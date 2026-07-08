import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Landmark, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setFormError('Please fill in all fields.');
    }
    
    setLoading(true);
    setFormError('');
    try {
      const data = await login(email, password);
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setFormError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const prefill = (role) => {
    if (role === 'admin') {
      setEmail('admin@panchayat.gov');
      setPassword('admin123');
    } else {
      setEmail('citizen@test.com');
      setPassword('citizen123');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16 relative">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce duration-1000">
            <Landmark className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide text-center">Smart Panchayat</h2>
          <p className="text-slate-400 text-xs mt-1">Welfare Scheme Information Portal</p>
        </div>

        {/* Form Error */}
        {formError && (
          <div className="bg-rose-950/40 border border-rose-950 text-rose-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                placeholder="citizen@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-colors glow-btn text-sm"
          >
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Pre-fill tools for rapid testing */}
        <div className="border-t border-slate-850 mt-6 pt-6">
          <p className="text-slate-500 text-center text-xs font-medium mb-3">Quick Demo Login (Pre-fill)</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => prefill('citizen')}
              className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 rounded-xl text-xs transition-colors"
            >
              <User className="h-3.5 w-3.5 text-emerald-400" />
              <span>Test Citizen</span>
            </button>
            <button
              onClick={() => prefill('admin')}
              className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 rounded-xl text-xs transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Test Admin</span>
            </button>
          </div>
        </div>

        <p className="text-slate-400 text-xs text-center mt-6">
          Not registered yet?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
