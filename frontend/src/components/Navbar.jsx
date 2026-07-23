import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/schemes', label: t('schemes') },
    { path: '/announcements', label: t('notices') },
  ];

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }} onClick={() => { setMenuOpen(false); setProfileOpen(false); }}>
            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
            }}>
              <Landmark size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{t('brand')}</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Welfare Portal</div>
            </div>
          </Link>

          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  color: isActive(path) ? '#1d4ed8' : '#475569',
                  background: isActive(path) ? '#dbeafe' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}
            {user?.role === 'citizen' && (
              <Link
                to="/dashboard"
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/dashboard') ? '#1d4ed8' : '#475569',
                  background: isActive('/dashboard') ? '#dbeafe' : 'transparent',
                }}
              >
                {language === 'ml' ? 'ഡാഷ്‌ബോർഡ്' : 'Dashboard'}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/admin/dashboard') ? '#7c3aed' : '#6d28d9',
                  background: isActive('/admin/dashboard') ? '#ede9fe' : 'transparent',
                }}
              >
                {t('adminPanel')}
              </Link>
            )}
          </div>

          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            
            <button
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Malayalam' : 'Switch to English'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #e2e8f0',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#2563eb',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
            >
              <Globe size={14} />
              <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            {token ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setMenuOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '10px',
                    border: '1.5px solid #bfdbfe',
                    background: '#eff6ff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#1d4ed8',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.75rem', fontWeight: 800
                  }}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} style={{ opacity: 0.7 }} />
                </button>

                {profileOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px',
                    padding: '0.5rem', minWidth: '200px', zIndex: 200,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ padding: '0.5rem 0.75rem 0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{user?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0' }}>{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.55rem 0.75rem', borderRadius: '8px',
                        color: '#334155', fontSize: '0.85rem', fontWeight: 600,
                        textDecoration: 'none', transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={15} color="#2563eb" />
                      {language === 'ml' ? 'ഡാഷ്‌ബോർഡ്' : 'Dashboard'}
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.55rem 0.75rem', borderRadius: '8px',
                        color: '#334155', fontSize: '0.85rem', fontWeight: 600,
                        textDecoration: 'none', transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={15} color="#16a34a" />
                      {t('profile')}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.55rem 0.75rem', borderRadius: '8px',
                          color: '#334155', fontSize: '0.85rem', fontWeight: 600,
                          textDecoration: 'none', transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LayoutDashboard size={15} color="#7c3aed" />
                        {t('adminPanel')}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.55rem 0.75rem', borderRadius: '8px',
                        color: '#dc2626', fontSize: '0.85rem', fontWeight: 600,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        width: '100%', textAlign: 'left', transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '0.45rem 0.9rem', borderRadius: '8px',
                    border: '1.5px solid #e2e8f0', background: '#fff',
                    color: '#334155', fontSize: '0.85rem', fontWeight: 600,
                    textDecoration: 'none', transition: 'all 0.2s ease'
                  }}
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '0.45rem 0.9rem', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                    textDecoration: 'none', transition: 'all 0.2s ease',
                    boxShadow: '0 3px 10px rgba(37,99,235,0.3)'
                  }}
                >
                  {t('register')}
                </Link>
              </div>
            )}

            
            <button
              onClick={() => { setMenuOpen(!menuOpen); setProfileOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '38px', height: '38px', borderRadius: '8px',
                border: '1.5px solid #e2e8f0', background: '#fff',
                cursor: 'pointer', color: '#334155'
              }}
              className="md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        
        {menuOpen && (
          <div style={{
            borderTop: '1px solid #f1f5f9',
            paddingBottom: '1rem',
            paddingTop: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }} className="md:hidden">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', padding: '0.6rem 0.75rem', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none',
                  color: isActive(path) ? '#1d4ed8' : '#475569',
                  background: isActive(path) ? '#dbeafe' : 'transparent'
                }}
              >
                {label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', color: '#6d28d9' }}>
                {t('adminPanel')}
              </Link>
            )}
            {token ? (
              <>
                {user?.role === 'citizen' && (
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', color: '#475569' }}>
                    {language === 'ml' ? 'ഡാഷ്‌ബോർഡ്' : 'Dashboard'}
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', color: '#475569' }}>
                  {t('profile')}
                </Link>
                <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  {t('logout')}
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 0.5rem' }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', color: '#334155', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>{t('login')}</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '0.6rem', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>{t('register')}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
