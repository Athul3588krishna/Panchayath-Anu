import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ArrowRight, BookOpen, BellRing, Download, Award, ShieldCheck, Users, ChevronRight, Leaf, Home as HomeIcon, GraduationCap } from 'lucide-react';
import { API_BASE_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({ schemesCount: 6, announcementsCount: 3, downloadsCount: 284, citizensCount: 154 });
  const [importantNotices, setImportantNotices] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [schemeRes, noticeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/schemes`),
          fetch(`${API_BASE_URL}/announcements`)
        ]);
        const schemes = await schemeRes.json();
        const notices = await noticeRes.json();
        const totalDownloads = schemes.reduce((acc, s) => acc + (s.downloadsCount || 0), 0);
        setImportantNotices(notices.filter(n => n.isImportant).slice(0, 2));
        setStats({ schemesCount: schemes.length, announcementsCount: notices.length, downloadsCount: totalDownloads || 284, citizensCount: 154 });
      } catch (err) { console.error(err); }
    };
    fetchHomeData();
  }, []);

  const categories = [
    { name: 'Animal Husbandry', ml: 'മൃഗസംരക്ഷണം', desc: 'Poultry farm support, goat distribution, livestock feed subsidies.', mlDesc: 'കോഴി വളർത്തൽ, ആട് വിതരണം, കാലിത്തീറ്റ സബ്‌സിഡി.', icon: Award, grad: 'linear-gradient(135deg,#f59e0b,#d97706)', light: '#fef9c3', border: '#fde68a', tc: '#92400e' },
    { name: 'Agriculture', ml: 'കൃഷി', desc: 'Seeds, organic farming guidance, fertilizer subsidies.', mlDesc: 'വിത്തുകൾ, ജൈവകൃഷി, വളം വിതരണ സബ്‌സിഡി.', icon: Leaf, grad: 'linear-gradient(135deg,#16a34a,#15803d)', light: '#dcfce7', border: '#bbf7d0', tc: '#14532d' },
    { name: 'Housing & Shelter', ml: 'ഭവന നിർമ്മാണം', desc: 'PMAY-G housing grants, renovation schemes, infrastructure.', mlDesc: 'ഭവന നിർമ്മാണ ഗ്രാന്റ്, PMAY-G, പുനരുദ്ധാരണ പദ്ധതി.', icon: HomeIcon, grad: 'linear-gradient(135deg,#2563eb,#1d4ed8)', light: '#dbeafe', border: '#bfdbfe', tc: '#1e3a8a' },
    { name: 'Education', ml: 'വിദ്യാഭ്യാസം', desc: 'Merit scholarships, book distribution, educational incentives.', mlDesc: 'മെറിറ്റ് സ്കോളർഷിപ്, പുസ്തക വിതരണം, വിദ്യാഭ്യാസ ഗ്രാന്റ്.', icon: GraduationCap, grad: 'linear-gradient(135deg,#7c3aed,#6d28d9)', light: '#ede9fe', border: '#ddd6fe', tc: '#4c1d95' },
  ];

  const statItems = [
    { label: t('welfareSchemes'), value: stats.schemesCount, icon: BookOpen, color: '#2563eb', bg: '#dbeafe' },
    { label: t('panchayatNotices'), value: stats.announcementsCount, icon: BellRing, color: '#7c3aed', bg: '#ede9fe' },
    { label: t('formsDownloaded'), value: `${stats.downloadsCount}+`, icon: Download, color: '#16a34a', bg: '#dcfce7' },
    { label: t('registeredCitizens'), value: `${stats.citizensCount}+`, icon: Users, color: '#d97706', bg: '#fef9c3' },
  ];

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ padding: '5rem 1.5rem 6rem' }}>
        <div className="hero-grid" />

        {/* Floating orbs */}
        <div className="hero-orb" style={{ position: 'absolute', top: '8%', right: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="hero-orb-delay" style={{ position: 'absolute', bottom: '10%', left: '5%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Tagline pill */}
          {importantNotices.length > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '999px', padding: '0.4rem 1.1rem',
              marginBottom: '1.75rem', cursor: 'default'
            }}>
              <BellRing size={14} color="#fbbf24" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                {importantNotices[0].title}
              </span>
              <Link to="/announcements" style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                {language === 'ml' ? 'കൂടുതൽ' : 'View →'}
              </Link>
            </div>
          )}

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            {t('heroTitle')}{' '}
            <span style={{ background: 'linear-gradient(90deg, #93c5fd, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {t('heroTitleHighlight')}
            </span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 2.5rem', fontWeight: 400 }}>
            {t('heroSubText')}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/schemes" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff', color: '#1d4ed8',
              fontWeight: 700, padding: '0.8rem 1.75rem',
              borderRadius: '12px', textDecoration: 'none', fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)', transition: 'all 0.25s ease'
            }}>
              {t('exploreSchemes')} <ArrowRight size={16} />
            </Link>
            <Link to="/schemes?eligible_only=1" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.12)', color: '#e2e8f0',
              fontWeight: 600, padding: '0.8rem 1.75rem',
              borderRadius: '12px', textDecoration: 'none', fontSize: '0.9rem',
              border: '1.5px solid rgba(255,255,255,0.2)', transition: 'all 0.25s ease',
              backdropFilter: 'blur(8px)'
            }}>
              {t('checkEligibility')} <ShieldCheck size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div style={{ maxWidth: 1100, margin: '-2.5rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {statItems.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: '16px', padding: '1.25rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,99,235,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ background: s.bg, borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section style={{ maxWidth: 1100, margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="section-label" style={{ marginBottom: '0.6rem' }}>{language === 'ml' ? 'വിഭാഗം' : 'BROWSE BY CATEGORY'}</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{t('browseByCategory')}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>{t('browseSubText')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                key={i}
                to={`/schemes?category=${encodeURIComponent(cat.name)}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#fff', border: `1px solid ${cat.border}`,
                  borderRadius: '16px', padding: '1.5rem',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${cat.border}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '14px',
                    background: cat.grad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: `0 4px 12px ${cat.border}`
                  }}>
                    <Icon size={22} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
                    {language === 'ml' ? cat.ml : cat.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 1rem', lineHeight: 1.6 }}>
                    {language === 'ml' ? cat.mlDesc : cat.desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontSize: '0.82rem', fontWeight: 700 }}>
                    {t('exploreSchemes')} <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '0.3rem 1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {language === 'ml' ? 'ലളിതമായ ഘട്ടങ്ങൾ' : '3 SIMPLE STEPS'}
              </span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem' }}>{t('howToApply')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { num: '01', title: t('step1Title'), desc: t('step1Desc'), color: '#fbbf24' },
              { num: '02', title: t('step2Title'), desc: t('step2Desc'), color: '#34d399' },
              { num: '03', title: t('step3Title'), desc: t('step3Desc'), color: '#818cf8' },
            ].map((step, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px', padding: '1.75rem'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: step.color, lineHeight: 1, marginBottom: '0.75rem', fontFamily: 'Inter', opacity: 0.9 }}>{step.num}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTICE ALERTS ── */}
      {importantNotices.length > 0 && (
        <section style={{ maxWidth: 1100, margin: '3.5rem auto', padding: '0 1.5rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              📢 {t('latestNotices')}
            </h2>
            <Link to="/announcements" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
              {t('viewNoticeBoard')} →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {importantNotices.map((notice, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid #bfdbfe',
                borderLeft: '4px solid #2563eb',
                borderRadius: '12px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                boxShadow: '0 2px 8px rgba(37,99,235,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#dbeafe', borderRadius: '8px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BellRing size={15} color="#2563eb" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{notice.title}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>{new Date(notice.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid #bfdbfe', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                  {t('important')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ASSISTANCE ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe', borderRadius: '20px',
          padding: '2.5rem', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap'
        }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>{t('needAssistance')}</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, maxWidth: 500, lineHeight: 1.65 }}>{t('assistanceDesc')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/schemes" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              color: '#fff', fontWeight: 700, padding: '0.8rem 1.5rem',
              borderRadius: '12px', textDecoration: 'none', fontSize: '0.875rem',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)', transition: 'all 0.25s ease'
            }}>
              {t('exploreSchemes')} <ArrowRight size={15} />
            </Link>
            <a href="mailto:panchayat@gov.in" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff', color: '#1d4ed8', fontWeight: 700,
              padding: '0.8rem 1.5rem', borderRadius: '12px',
              textDecoration: 'none', fontSize: '0.875rem',
              border: '1.5px solid #bfdbfe'
            }}>
              {t('emailSupport')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
