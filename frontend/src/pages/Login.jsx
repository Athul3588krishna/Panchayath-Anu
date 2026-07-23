import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Landmark, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  
  const isAdminLogin = location.hash === '#admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  
  useEffect(() => {
    setEmail('');
    setPassword('');
    setFormError('');
  }, [isAdminLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setFormError('Please fill in all fields.');
    }

    setLoading(true);
    setFormError('');
    try {
      const data = await login(email, password);

      if (isAdminLogin && data.role !== 'admin') {
        setFormError('Access denied. This login portal is for administrators only.');
        setLoading(false);
        return;
      }

      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setFormError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', background: isAdminLogin ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : '#f1f5f9', minHeight: '80vh', position: 'relative' }}>

      
      {isAdminLogin && (
        <>
          <div style={{ position: 'absolute', top: '20%', left: '15%', width: 260, height: 260, background: 'rgba(99,102,241,0.12)', borderRadius: '50%', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 200, height: 200, background: 'rgba(139,92,246,0.1)', borderRadius: '50%', filter: 'blur(50px)' }} />
        </>
      )}

      <div style={{ width: '100%', maxWidth: 440, background: isAdminLogin ? 'rgba(15,23,42,0.85)' : '#ffffff', border: `1px solid ${isAdminLogin ? 'rgba(99,102,241,0.3)' : '#e2e8f0'}`, borderRadius: 24, padding: '2.5rem', boxShadow: isAdminLogin ? '0 25px 60px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.06)', backdropFilter: isAdminLogin ? 'blur(20px)' : 'none', position: 'relative', zIndex: 1 }}>

        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ background: isAdminLogin ? 'rgba(99,102,241,0.15)' : '#dbeafe', border: `1px solid ${isAdminLogin ? 'rgba(99,102,241,0.4)' : '#bfdbfe'}`, borderRadius: 16, padding: '0.85rem', marginBottom: '1rem' }}>
            {isAdminLogin
              ? <ShieldCheck size={30} color="#818cf8" />
              : <Landmark size={30} color="#2563eb" />
            }
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: isAdminLogin ? '#f1f5f9' : '#0f172a', margin: 0, textAlign: 'center', letterSpacing: '-0.5px' }}>
            {isAdminLogin ? 'Administrator Portal' : 'Smart Panchayat'}
          </h2>
          <p style={{ color: isAdminLogin ? '#94a3b8' : '#64748b', fontSize: '0.82rem', margin: '0.4rem 0 0', textAlign: 'center' }}>
            {isAdminLogin
              ? 'Restricted access — Authorised personnel only'
              : 'Welfare Scheme Information Portal'}
          </p>

          
          {isAdminLogin && (
            <div style={{ marginTop: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 999, padding: '0.3rem 0.85rem' }}>
              <ShieldCheck size={12} color="#818cf8" />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Access Only</span>
            </div>
          )}
        </div>

        
        {formError && (
          <div style={{ background: isAdminLogin ? 'rgba(220,38,38,0.1)' : '#fef2f2', border: `1px solid ${isAdminLogin ? 'rgba(220,38,38,0.3)' : '#fecaca'}`, color: isAdminLogin ? '#fca5a5' : '#b91c1c', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {formError}
          </div>
        )}

        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: isAdminLogin ? '#94a3b8' : '#475569', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: isAdminLogin ? '#475569' : '#94a3b8' }} />
              <input
                type="email"
                placeholder={isAdminLogin ? 'admin@panchayat.gov' : 'your@email.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', background: isAdminLogin ? 'rgba(30,41,59,0.8)' : '#f8fafc', border: `1.5px solid ${isAdminLogin ? 'rgba(99,102,241,0.25)' : '#e2e8f0'}`, borderRadius: 12, padding: '0.75rem 1rem 0.75rem 2.5rem', fontSize: '0.875rem', color: isAdminLogin ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = isAdminLogin ? '#6366f1' : '#2563eb'}
                onBlur={e => e.target.style.borderColor = isAdminLogin ? 'rgba(99,102,241,0.25)' : '#e2e8f0'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: isAdminLogin ? '#94a3b8' : '#475569', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: isAdminLogin ? '#475569' : '#94a3b8' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', background: isAdminLogin ? 'rgba(30,41,59,0.8)' : '#f8fafc', border: `1.5px solid ${isAdminLogin ? 'rgba(99,102,241,0.25)' : '#e2e8f0'}`, borderRadius: 12, padding: '0.75rem 1rem 0.75rem 2.5rem', fontSize: '0.875rem', color: isAdminLogin ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = isAdminLogin ? '#6366f1' : '#2563eb'}
                onBlur={e => e.target.style.borderColor = isAdminLogin ? 'rgba(99,102,241,0.25)' : '#e2e8f0'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: isAdminLogin ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, padding: '0.875rem', borderRadius: 12, border: 'none', fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: isAdminLogin ? '0 6px 20px rgba(99,102,241,0.35)' : '0 6px 20px rgba(37,99,235,0.3)', transition: 'all 0.2s ease', marginTop: '0.5rem' }}
          >
            {loading ? 'Signing in...' : (isAdminLogin ? 'Access Admin Dashboard' : 'Sign In')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: `1px solid ${isAdminLogin ? 'rgba(99,102,241,0.15)' : '#f1f5f9'}`, paddingTop: '1.25rem' }}>
          {isAdminLogin ? (
            <p style={{ color: '#475569', fontSize: '0.78rem' }}>
              Citizen?{' '}
              <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                Go to Citizen Login →
              </Link>
            </p>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.78rem' }}>
              New citizen?{' '}
              <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                Create an account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
