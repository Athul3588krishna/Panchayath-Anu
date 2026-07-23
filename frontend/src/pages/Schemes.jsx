import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, BookOpen, AlertCircle, FileText, CheckCircle2, XCircle, Download, RefreshCw, Eye, Calendar, CalendarX } from 'lucide-react';
import CountdownBadge from '../components/CountdownBadge';
import { generateApplicationPDF } from '../utils/pdfGenerator';

const Schemes = () => {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [checkerAge, setCheckerAge] = useState('');
  const [checkerIncome, setCheckerIncome] = useState('');
  const [checkerOcc, setCheckerOcc] = useState('');
  const [checkerCat, setCheckerCat] = useState('');
  const [useProfile, setUseProfile] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [checking, setChecking] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [activeScheme, setActiveScheme] = useState(null);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appFeedback, setAppFeedback] = useState({ type: '', text: '' });
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const categories = ['All', 'Agriculture', 'Animal Husbandry', 'Housing', 'Education', 'Social Welfare', 'Health', 'Employment'];
  const occupationsList = ['Farmer', 'Agriculture worker', 'Daily Wage Labourer', 'Unemployed', 'Student', 'Self Employed', 'Housewife', 'Other'];

  const isExpired = (scheme) => {
    if (!scheme.expiresAt) return false;
    return new Date(scheme.expiresAt) < new Date();
  };

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const categoryParam = searchParams.get('category');
      const searchParam = searchParams.get('search');
      let url = `${API_BASE_URL}/schemes`;
      const queryParams = [];
      if (categoryParam && categoryParam !== 'All') { queryParams.push(`category=${encodeURIComponent(categoryParam)}`); setSelectedCategory(categoryParam); }
      if (searchParam) { queryParams.push(`search=${encodeURIComponent(searchParam)}`); setSearchQuery(searchParam); }
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      const res = await fetch(url);
      if (res.ok) { const data = await res.json(); setSchemes(data); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSchemes(); }, [searchParams]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    const p = new URLSearchParams(searchParams);
    if (category === 'All') p.delete('category'); else p.set('category', category);
    setSearchParams(p);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (searchQuery.trim() === '') p.delete('search'); else p.set('search', searchQuery);
    setSearchParams(p);
  };

  const handleUseProfileToggle = () => {
    if (!useProfile && user) {
      setCheckerAge(user.age !== null ? String(user.age) : '');
      setCheckerIncome(user.annualIncome !== null ? String(user.annualIncome) : '');
      setCheckerOcc(user.occupation || '');
      setCheckerCat(user.category || '');
      setUseProfile(true);
    } else { setUseProfile(false); }
  };

  const runEligibilityChecker = async (e) => {
    if (e) e.preventDefault();
    setChecking(true); setEligibilityChecked(true);
    try {
      const res = await fetch(`${API_BASE_URL}/schemes/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: checkerAge !== '' ? Number(checkerAge) : null, annualIncome: checkerIncome !== '' ? Number(checkerIncome) : null, occupation: checkerOcc, category: checkerCat })
      });
      if (res.ok) { const data = await res.json(); setEligibleSchemes(data); }
    } catch (err) { console.error(err); }
    finally { setChecking(false); }
  };

  useEffect(() => {
    if (user && searchParams.get('eligible_only') === '1') {
      setCheckerAge(user.age !== null ? String(user.age) : '');
      setCheckerIncome(user.annualIncome !== null ? String(user.annualIncome) : '');
      setCheckerOcc(user.occupation || '');
      setCheckerCat(user.category || '');
      setUseProfile(true);
      setTimeout(() => {
        setChecking(true); setEligibilityChecked(true);
        fetch(`${API_BASE_URL}/schemes/check-eligibility`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ age: user.age, annualIncome: user.annualIncome, occupation: user.occupation, category: user.category })
        }).then(r => r.json()).then(data => { setEligibleSchemes(data); setChecking(false); });
      }, 300);
    }
  }, [user, searchParams]);

  
  const handleDownload = async (scheme) => {
    setGeneratingPdf(true);
    try {
      await fetch(`${API_BASE_URL}/schemes/${scheme._id}/download`, { method: 'POST' }).catch(() => {});
      setSchemes(prev => prev.map(s => s._id === scheme._id ? { ...s, downloadsCount: (s.downloadsCount || 0) + 1 } : s));

      if (scheme.formUrl && scheme.formUrl.startsWith('http')) {
        window.open(scheme.formUrl, '_blank');
      } else {
        
        await generateApplicationPDF(scheme, user);
      }
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleViewScheme = async (scheme) => {
    setActiveScheme(scheme); setAppFeedback({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE_URL}/schemes/${scheme._id}`);
      if (res.ok) { const updated = await res.json(); setSchemes(prev => prev.map(s => s._id === scheme._id ? updated : s)); setActiveScheme(updated); }
    } catch (err) { console.log(err); }
  };

  const handleApplyOnline = async (schemeId) => {
    if (!token) { setAppFeedback({ type: 'error', text: language === 'ml' ? 'ഓൺലൈനായി അപേക്ഷിക്കാൻ ദയവായി ലോഗിൻ ചെയ്യുക.' : 'Please log in to submit an online application.' }); return; }
    setSubmittingApp(true); setAppFeedback({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ schemeId })
      });
      const data = await res.json();
      if (res.ok) {
        setAppFeedback({ type: 'success', text: language === 'ml' ? 'അപേക്ഷ ഓൺലൈനായി സമർപ്പിച്ചു! നില പ്രൊഫൈൽ പേജിൽ പരിശോധിക്കാം.' : 'Application submitted! Track status in your Profile.' });
      } else {
        setAppFeedback({ type: 'error', text: data.message || 'Submission failed.' });
      }
    } catch (err) { setAppFeedback({ type: 'error', text: 'Network error.' }); }
    finally { setSubmittingApp(false); }
  };

  const schemeCard = (scheme, eligibleBadge = null) => {
    const expired = isExpired(scheme);
    return (
      <div key={scheme._id} style={{
        background: '#fff', border: `1px solid ${expired ? '#fecaca' : '#e2e8f0'}`,
        borderRadius: '16px', padding: '1.25rem',
        opacity: expired ? 0.75 : 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '999px', padding: '0.18rem 0.65rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>{scheme.category}</span>
            <CountdownBadge expiresAt={scheme.expiresAt} />
            {eligibleBadge}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => handleViewScheme(scheme)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
              <Eye size={13} /> {t('detailsBtn')}
            </button>
            <button onClick={() => handleDownload(scheme)} disabled={generatingPdf} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: generatingPdf ? 'wait' : 'pointer' }}>
              <Download size={13} /> {generatingPdf ? 'Generating...' : t('getFormBtn')}
            </button>
          </div>
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>{scheme.title}</h3>
        <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{scheme.description}</p>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
          <span>👁 {scheme.viewsCount || 0} views</span>
          <span>📥 {scheme.downloadsCount || 0} downloads</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>{t('schemesTitle')}</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{t('schemesSubText')}</p>
      </div>

      {appFeedback.text && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 600, background: appFeedback.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${appFeedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`, color: appFeedback.type === 'success' ? '#15803d' : '#b91c1c' }}>
          <AlertCircle size={18} />
          <span style={{ flex: 1 }}>{appFeedback.text}</span>
          <button onClick={() => setAppFeedback({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, fontSize: '0.8rem' }}>{t('closeBtn')}</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }} className="schemes-grid">
        
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>{t('interactiveScreening')}</h3>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>{t('screeningSubText')}</p>

          <form onSubmit={runEligibilityChecker} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {user && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.6rem 0.85rem', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>{t('pullProfile')}</span>
                <input type="checkbox" checked={useProfile} onChange={handleUseProfileToggle} style={{ accentColor: '#2563eb', width: 16, height: 16 }} />
              </label>
            )}
            {[
              { label: language === 'ml' ? 'പ്രായം' : 'Age', value: checkerAge, setter: setCheckerAge, type: 'number', placeholder: language === 'ml' ? 'പ്രായം' : 'Enter age' },
              { label: language === 'ml' ? 'വാർഷിക വരുമാനം (₹)' : 'Annual Income (₹)', value: checkerIncome, setter: setCheckerIncome, type: 'number', placeholder: language === 'ml' ? 'വരുമാനം' : 'Enter income' },
            ].map(({ label, value, setter, type, placeholder }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>{label}</label>
                <input type={type} placeholder={placeholder} value={value} onChange={e => { setter(e.target.value); setUseProfile(false); }}
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>{language === 'ml' ? 'ജോലി' : 'Occupation'}</label>
              <select value={checkerOcc} onChange={e => { setCheckerOcc(e.target.value); setUseProfile(false); }} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#0f172a', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="">{language === 'ml' ? 'എല്ലാ ജോലികളും' : 'All Occupations'}</option>
                {occupationsList.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>{language === 'ml' ? 'സാമൂഹിക വിഭാഗം' : 'Social Category'}</label>
              <select value={checkerCat} onChange={e => { setCheckerCat(e.target.value); setUseProfile(false); }} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#0f172a', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="">{language === 'ml' ? 'എല്ലാ വിഭാഗങ്ങളും' : 'All Categories'}</option>
                {['General', 'OBC', 'SC', 'ST'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" disabled={checking} style={{ padding: '0.7rem', borderRadius: '10px', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', fontWeight: 700, border: 'none', cursor: checking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
              {checking ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> {language === 'ml' ? 'പരിശോധിക്കുന്നു...' : 'Analyzing...'}</> : t('verifyBtn')}
            </button>
          </form>
        </div>

        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" placeholder={t('searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '0.6rem 0.75rem 0.6rem 2.5rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: '#fff', border: '1.5px solid #e2e8f0', color: '#334155', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>{t('searchBtn')}</button>
            </form>
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => handleCategoryClick(cat)} style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', border: selectedCategory === cat ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0', background: selectedCategory === cat ? '#dbeafe' : '#fff', color: selectedCategory === cat ? '#1d4ed8' : '#475569', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}>
                  {cat === 'All' ? t('allCategories') : cat}
                </button>
              ))}
            </div>
          </div>

          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
              <span>Loading schemes...</span>
            </div>
          ) : eligibilityChecked ? (
            (() => {
              const filtered = eligibleSchemes.filter(item => {
                const fullScheme = schemes.find(s => s._id === item.scheme._id) || item.scheme;
                const matchesCategory = selectedCategory === 'All' || fullScheme.category === selectedCategory;
                const matchesSearch = !searchQuery.trim() || 
                  fullScheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  fullScheme.description.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('screeningResults')} ({filtered.length})
                    </span>
                    <button onClick={() => { setEligibilityChecked(false); setEligibleSchemes([]); }} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                      {t('clearResults')}
                    </button>
                  </div>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      <p>{language === 'ml' ? 'ഈ വിഭാഗത്തിൽ അർഹതയുള്ള പദ്ധതികൾ ഒന്നും തന്നെയില്ല.' : 'No eligible schemes found in this category.'}</p>
                    </div>
                  ) : (
                    filtered.map(item => {
                      const fullScheme = schemes.find(s => s._id === item.scheme._id) || item.scheme;
                      const badge = item.isEligible
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '999px', padding: '0.18rem 0.65rem', fontSize: '0.68rem', fontWeight: 700 }}><CheckCircle2 size={11} />{t('eligible')}</span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '999px', padding: '0.18rem 0.65rem', fontSize: '0.68rem', fontWeight: 700 }}><XCircle size={11} />{t('notEligible')}</span>;
                      return (
                        <div key={item.scheme._id}>
                          {schemeCard(fullScheme, badge)}
                          {!item.isEligible && item.reasons?.length > 0 && (
                            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.75rem 1rem', marginTop: '0.4rem' }}>
                              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c2410c', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>Unmet Requirements:</p>
                              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                {item.reasons.map((r, i) => <li key={i} style={{ fontSize: '0.82rem', color: '#9a3412' }}>{r}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })()
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {schemes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                  <FileText size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                  <p>No schemes found.</p>
                </div>
              ) : schemes.map(scheme => schemeCard(scheme))}
            </div>
          )}
        </div>
      </div>

      
      {activeScheme && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={e => { if (e.target === e.currentTarget) setActiveScheme(null); }}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setActiveScheme(null)} style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#475569' }}>✕</button>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '999px', padding: '0.22rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{activeScheme.category}</span>
              <CountdownBadge expiresAt={activeScheme.expiresAt} />
              {isExpired(activeScheme) && (
                <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '999px', padding: '0.22rem 0.75rem', fontSize: '0.7rem', fontWeight: 700 }}>Applications Closed</span>
              )}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem' }}>{activeScheme.title}</h2>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{activeScheme.description}</p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.85rem' }}>{t('eligibilityGuidelines')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><span style={{ fontWeight: 700, color: '#334155' }}>{t('ageBracket')}: </span><span style={{ color: '#475569' }}>{activeScheme.eligibilityCriteria?.minAge || 0}–{activeScheme.eligibilityCriteria?.maxAge || 150} yrs</span></div>
                <div><span style={{ fontWeight: 700, color: '#334155' }}>{t('maxIncome')}: </span><span style={{ color: '#475569' }}>{activeScheme.eligibilityCriteria?.maxIncome ? `₹${activeScheme.eligibilityCriteria.maxIncome.toLocaleString()}` : 'No Limit'}</span></div>
                <div><span style={{ fontWeight: 700, color: '#334155' }}>{t('targetOccupations')}: </span><span style={{ color: '#475569' }}>{activeScheme.eligibilityCriteria?.allowedOccupations?.length > 0 ? activeScheme.eligibilityCriteria.allowedOccupations.join(', ') : 'All'}</span></div>
                <div><span style={{ fontWeight: 700, color: '#334155' }}>{t('socialCategories')}: </span><span style={{ color: '#475569' }}>{activeScheme.eligibilityCriteria?.allowedCategories?.length > 0 ? activeScheme.eligibilityCriteria.allowedCategories.join(', ') : 'All'}</span></div>
              </div>
            </div>

            {activeScheme.requiredDocuments?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.6rem' }}>{t('requiredDocs')}</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {activeScheme.requiredDocuments.map((doc, i) => <li key={i} style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem' }}>{doc}</li>)}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleDownload(activeScheme)} disabled={generatingPdf} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 700, cursor: generatingPdf ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                <Download size={15} /> {generatingPdf ? 'Generating PDF...' : t('downloadFormBtn')}
              </button>
              {!isExpired(activeScheme) && (
                <button onClick={() => { handleApplyOnline(activeScheme._id); setActiveScheme(null); }} disabled={submittingApp} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', fontWeight: 700, border: 'none', cursor: submittingApp ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}>
                  {t('applyOnlineBtn')}
                </button>
              )}
              {isExpired(activeScheme) && (
                <div style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', fontWeight: 700, fontSize: '0.875rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <CalendarX size={16} /> Applications Closed
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
