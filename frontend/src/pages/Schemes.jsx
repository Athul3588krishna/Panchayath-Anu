import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, BookOpen, AlertCircle, FileText, CheckCircle2, XCircle, Download, RefreshCw, Eye, Landmark } from 'lucide-react';

const Schemes = () => {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and Filter State
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Eligibility Checker State
  const [checkerAge, setCheckerAge] = useState('');
  const [checkerIncome, setCheckerIncome] = useState('');
  const [checkerOcc, setCheckerOcc] = useState('');
  const [checkerCat, setCheckerCat] = useState('');
  const [useProfile, setUseProfile] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [checking, setChecking] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  // Selected Scheme for details modal
  const [activeScheme, setActiveScheme] = useState(null);

  // Application submission status overlay
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appFeedback, setAppFeedback] = useState({ type: '', text: '' });

  const categories = ['All', 'Agriculture', 'Animal Husbandry', 'Housing', 'Education', 'Social Welfare', 'Health', 'Employment'];

  const occupationsList = [
    'Farmer',
    'Agriculture worker',
    'Daily Wage Labourer',
    'Unemployed',
    'Student',
    'Self Employed',
    'Housewife',
    'Other'
  ];

  // Fetch schemes
  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const categoryParam = searchParams.get('category');
      const searchParam = searchParams.get('search');
      
      let url = `${API_BASE_URL}/schemes`;
      const queryParams = [];
      
      if (categoryParam && categoryParam !== 'All') {
        queryParams.push(`category=${encodeURIComponent(categoryParam)}`);
        setSelectedCategory(categoryParam);
      }
      if (searchParam) {
        queryParams.push(`search=${encodeURIComponent(searchParam)}`);
        setSearchQuery(searchParam);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSchemes(data);
      }
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [searchParams]);

  // Handle category tab clicks
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim() === '') {
      newParams.delete('search');
    } else {
      newParams.set('search', searchQuery);
    }
    setSearchParams(newParams);
  };

  // Toggle pulling profile details for checker
  const handleUseProfileToggle = () => {
    if (!useProfile && user) {
      setCheckerAge(user.age !== null ? String(user.age) : '');
      setCheckerIncome(user.annualIncome !== null ? String(user.annualIncome) : '');
      setCheckerOcc(user.occupation || '');
      setCheckerCat(user.category || '');
      setUseProfile(true);
    } else {
      setUseProfile(false);
    }
  };

  // Run checker rules
  const runEligibilityChecker = async (e) => {
    if (e) e.preventDefault();
    setChecking(true);
    setEligibilityChecked(true);

    try {
      const res = await fetch(`${API_BASE_URL}/schemes/check-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          age: checkerAge !== '' ? Number(checkerAge) : null,
          annualIncome: checkerIncome !== '' ? Number(checkerIncome) : null,
          occupation: checkerOcc,
          category: checkerCat
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEligibleSchemes(data);
      }
    } catch (err) {
      console.error('Error running eligibility checker:', err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (user && searchParams.get('eligible_only') === '1') {
      setCheckerAge(user.age !== null ? String(user.age) : '');
      setCheckerIncome(user.annualIncome !== null ? String(user.annualIncome) : '');
      setCheckerOcc(user.occupation || '');
      setCheckerCat(user.category || '');
      setUseProfile(true);
      
      setTimeout(() => {
        setChecking(true);
        setEligibilityChecked(true);
        fetch(`${API_BASE_URL}/schemes/check-eligibility`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            age: user.age,
            annualIncome: user.annualIncome,
            occupation: user.occupation,
            category: user.category
          })
        }).then(res => res.json()).then(data => {
          setEligibleSchemes(data);
          setChecking(false);
        });
      }, 300);
    }
  }, [user, searchParams]);

  // Download Handler
  const handleDownload = async (scheme) => {
    try {
      await fetch(`${API_BASE_URL}/schemes/${scheme._id}/download`, {
        method: 'POST'
      });

      setSchemes(prev => prev.map(s => {
        if (s._id === scheme._id) {
          return { ...s, downloadsCount: (s.downloadsCount || 0) + 1 };
        }
        return s;
      }));

      if (scheme.formUrl) {
        const downloadUrl = scheme.formUrl.startsWith('http') 
          ? scheme.formUrl 
          : `http://localhost:5000${scheme.formUrl}`;
        window.open(downloadUrl, '_blank');
      } else {
        const fileContent = `======================================================
SMART PANCHAYAT WELFARE SCHEME APPLICATION FORM
======================================================
SCHEME NAME: ${scheme.title}
CATEGORY: ${scheme.category}
DATE GENERATED: ${new Date().toLocaleDateString()}

------------------------------------------------------
APPLICANT INFORMATION (Pre-filled / Verification Template)
------------------------------------------------------
NAME: ${user?.name || '________________________'}
EMAIL: ${user?.email || '________________________'}
AGE: ${user?.age || '____'} Years
ANNUAL HOUSEHOLD INCOME: ₹${user?.annualIncome || '________'}
OCCUPATION: ${user?.occupation || '________________________'}
SOCIAL CATEGORY: ${user?.category || '____'} (General/OBC/SC/ST)

------------------------------------------------------
REQUIRED ATTACHMENT CHECKLIST
------------------------------------------------------
${scheme.requiredDocuments.map((doc, i) => `[ ] ${i + 1}. ${doc}`).join('\n')}

------------------------------------------------------
CITIZEN DECLARATION
------------------------------------------------------
I hereby declare that the particulars given above are true and correct to the best of my knowledge and belief and nothing has been concealed thereof.

Signature of Applicant: ________________________
Date: ____/____/________

======================================================
Submit this completed document at the Panchayat Office counter.
======================================================`;

        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Application_Form_${scheme.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error handling download count:', err);
    }
  };

  const handleViewScheme = async (scheme) => {
    setActiveScheme(scheme);
    try {
      const res = await fetch(`${API_BASE_URL}/schemes/${scheme._id}`);
      if (res.ok) {
        const updatedScheme = await res.json();
        setSchemes(prev => prev.map(s => s._id === scheme._id ? updatedScheme : s));
      }
    } catch (err) {
      console.log('Error incrementing view:', err);
    }
  };

  // Submit Application Online
  const handleApplyOnline = async (schemeId) => {
    if (!token) {
      setAppFeedback({
        type: 'error',
        text: language === 'ml' ? 'ഓൺലൈനായി അപേക്ഷിക്കാൻ ദയവായി ലോഗിൻ ചെയ്യുക.' : 'Please log in to submit application online.'
      });
      return;
    }

    setSubmittingApp(true);
    setAppFeedback({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ schemeId })
      });
      const data = await res.json();

      if (res.ok) {
        setAppFeedback({
          type: 'success',
          text: language === 'ml' 
            ? 'അപേക്ഷ ഓൺലൈനായി സമർപ്പിച്ചു! നില പ്രൊഫൈൽ പേജിൽ പരിശോധിക്കാം.' 
            : 'Application submitted online! Track its status under your Profile.'
        });
      } else {
        setAppFeedback({
          type: 'error',
          text: data.message || 'Application submission failed.'
        });
      }
    } catch (err) {
      setAppFeedback({
        type: 'error',
        text: 'Network error submitting online application.'
      });
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-10">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('schemesTitle')}</h1>
        <p className="text-slate-400 text-sm">{t('schemesSubText')}</p>
      </div>

      {/* Feedback Banner for Online Applications */}
      {appFeedback.text && (
        <div className={`px-4 py-3.5 rounded-2xl text-xs md:text-sm border font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
          appFeedback.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-900 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-900 text-rose-300'
        }`}>
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="flex-grow">{appFeedback.text}</span>
          <button 
            onClick={() => setAppFeedback({ type: '', text: '' })}
            className="text-[10px] font-bold uppercase tracking-wider underline hover:text-white"
          >
            {t('closeBtn')}
          </button>
        </div>
      )}

      {/* Grid: Search/Filter + Directory vs. Eligibility Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Eligibility Checker Tool */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/40 to-slate-950/20">
            <h3 className="text-white font-bold text-lg mb-2">{t('interactiveScreening')}</h3>
            <p className="text-slate-400 text-xs mb-6">{t('screeningSubText')}</p>

            <form onSubmit={runEligibilityChecker} className="space-y-4">
              {user && (
                <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
                  <span className="text-xs text-slate-300 font-semibold">{t('pullProfile')}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useProfile}
                      onChange={handleUseProfileToggle}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-600"></div>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">{language === 'ml' ? 'പ്രായം' : 'Age'}</label>
                <input
                  type="number"
                  placeholder={language === 'ml' ? 'പ്രായം നൽകുക' : 'Enter age'}
                  value={checkerAge}
                  onChange={(e) => { setCheckerAge(e.target.value); setUseProfile(false); }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3.5 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">{language === 'ml' ? 'വാർഷിക വരുമാനം (₹)' : 'Annual Income (₹)'}</label>
                <input
                  type="number"
                  placeholder={language === 'ml' ? 'വരുമാനം നൽകുക' : 'Enter annual income'}
                  value={checkerIncome}
                  onChange={(e) => { setCheckerIncome(e.target.value); setUseProfile(false); }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3.5 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">{language === 'ml' ? 'ജോലി' : 'Occupation'}</label>
                <select
                  value={checkerOcc}
                  onChange={(e) => { setCheckerOcc(e.target.value); setUseProfile(false); }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3.5 text-sm text-slate-100 outline-none"
                >
                  <option value="">{language === 'ml' ? 'എല്ലാ ജോലികളും' : 'All Occupations'}</option>
                  {occupationsList.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">{language === 'ml' ? 'സാമൂഹിക വിഭാഗം' : 'Social Category'}</label>
                <select
                  value={checkerCat}
                  onChange={(e) => { setCheckerCat(e.target.value); setUseProfile(false); }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3.5 text-sm text-slate-100 outline-none"
                >
                  <option value="">{language === 'ml' ? 'എല്ലാ വിഭാഗങ്ങളും' : 'All Categories'}</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={checking}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors text-sm glow-btn"
              >
                {checking ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{language === 'ml' ? 'പരിശോധിക്കുന്നു...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <span>{t('verifyBtn')}</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Schemes Display and Filters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search bar and Category Tabs */}
          <div className="space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-650 outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 rounded-xl font-semibold text-sm transition-colors animate-none"
              >
                {t('searchBtn')}
              </button>
            </form>

            {/* Category tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-300'
                  }`}
                >
                  {cat === 'All' ? t('allCategories') : language === 'ml'
                    ? (cat === 'Animal Husbandry' ? 'മൃഗസംരക്ഷണം' : cat === 'Agriculture' ? 'കൃഷി' : cat === 'Housing' ? 'ഭവനം' : cat === 'Education' ? 'വിദ്യാഭ്യാസം' : cat === 'Social Welfare' ? 'ക്ഷേമകാര്യം' : cat === 'Health' ? 'ആരോഗ്യം' : 'തൊഴിൽ') 
                    : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Listings */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-450 mb-2" />
              <span>Fetching Schemes...</span>
            </div>
          ) : eligibilityChecked ? (
            /* Show Screening Results */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('screeningResults')} ({eligibleSchemes.length})</span>
                <button
                  onClick={() => { setEligibilityChecked(false); setEligibleSchemes([]); }}
                  className="text-xs text-rose-450 hover:underline"
                >
                  {t('clearResults')}
                </button>
              </div>

              {eligibleSchemes.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No schemes found matching criteria.</p>
              ) : (
                eligibleSchemes.map((item) => {
                  const fullScheme = schemes.find(s => s._id === item.scheme._id) || item.scheme;
                  return (
                    <div
                      key={item.scheme._id}
                      className={`glass-card p-5 rounded-2xl border transition-all ${
                        item.isEligible 
                          ? 'border-emerald-500/20 hover:border-emerald-500/40' 
                          : 'border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-slate-850 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">
                              {item.scheme.category}
                            </span>
                            {item.isEligible ? (
                              <span className="flex items-center text-emerald-400 text-xs font-bold space-x-0.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{t('eligible')}</span>
                              </span>
                            ) : (
                              <span className="flex items-center text-rose-400 text-xs font-bold space-x-0.5">
                                <XCircle className="h-3.5 w-3.5" />
                                <span>{t('notEligible')}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-white font-bold text-base md:text-lg">{item.scheme.title}</h4>
                          <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">{item.scheme.description}</p>
                        </div>
                        <div className="flex md:flex-col gap-2 md:items-end shrink-0 pt-2">
                          <button
                            onClick={() => handleViewScheme(fullScheme)}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{t('detailsBtn')}</span>
                          </button>
                          {item.isEligible && (
                            <>
                              <button
                                onClick={() => handleDownload(fullScheme)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-205 border border-slate-750 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>{t('getFormBtn')}</span>
                              </button>
                              <button
                                onClick={() => handleApplyOnline(fullScheme._id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 glow-btn"
                              >
                                <span>{t('applyOnlineBtn')}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {!item.isEligible && item.reasons.length > 0 && (
                        <div className="mt-3 bg-slate-900/60 border border-slate-850 p-2.5 rounded-xl space-y-1">
                          <p className="text-[10px] text-rose-450 font-bold uppercase tracking-wider flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>Failed Requirements:</span>
                          </p>
                          <ul className="list-disc pl-4 text-xs text-slate-400 space-y-0.5">
                            {item.reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Show Standard Directory */
            <div className="space-y-4">
              {schemes.length === 0 ? (
                <div className="text-center py-12 text-slate-505 border border-slate-900 rounded-3xl">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No welfare schemes found in directory.</p>
                </div>
              ) : (
                schemes.map((scheme) => (
                  <div
                    key={scheme._id}
                    className="glass-card p-5 rounded-2xl glass-card-hover border border-slate-800/80 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="bg-slate-850 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">
                          {scheme.category}
                        </span>
                        <h4 className="text-white font-bold text-base md:text-lg">{scheme.title}</h4>
                        <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">{scheme.description}</p>
                        
                        <div className="flex items-center space-x-4 pt-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          <span>Views: {scheme.viewsCount || 0}</span>
                          <span>Downloads: {scheme.downloadsCount || 0}</span>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2 md:items-end shrink-0 pt-2">
                        <button
                          onClick={() => handleViewScheme(scheme)}
                          className="bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{t('detailsBtn')}</span>
                        </button>
                        <button
                          onClick={() => handleDownload(scheme)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 glow-btn"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{t('getFormBtn')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scheme Detail Modal overlay */}
      {activeScheme && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setActiveScheme(null)}
              className="absolute top-4 right-4 text-slate-550 hover:text-white font-semibold text-lg bg-slate-900 border border-slate-800 h-8 w-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-900">
              {activeScheme.category}
            </span>

            <h3 className="text-white font-extrabold text-2xl mt-4 mb-2">{activeScheme.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{activeScheme.description}</p>

            {/* Scheme Criteria Overview */}
            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl mb-6">
              <h4 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-3">{t('eligibilityGuidelines')}</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                <li>
                  <span className="font-semibold text-slate-300">{t('ageBracket')}:</span>{' '}
                  {activeScheme.eligibilityCriteria?.minAge || 0} to{' '}
                  {activeScheme.eligibilityCriteria?.maxAge || 150} Years
                </li>
                <li>
                  <span className="font-semibold text-slate-300">{t('maxIncome')}:</span>{' '}
                  {activeScheme.eligibilityCriteria?.maxIncome 
                    ? `₹${activeScheme.eligibilityCriteria.maxIncome} / Year` 
                    : 'No Limit'}
                </li>
                <li>
                  <span className="font-semibold text-slate-300">{t('targetOccupations')}:</span>{' '}
                  {activeScheme.eligibilityCriteria?.allowedOccupations && activeScheme.eligibilityCriteria.allowedOccupations.length > 0 
                    ? activeScheme.eligibilityCriteria.allowedOccupations.join(', ') 
                    : 'All Occupations'}
                </li>
                <li>
                  <span className="font-semibold text-slate-300">{t('socialCategories')}:</span>{' '}
                  {activeScheme.eligibilityCriteria?.allowedCategories && activeScheme.eligibilityCriteria.allowedCategories.length > 0 
                    ? activeScheme.eligibilityCriteria.allowedCategories.join(', ') 
                    : 'All Categories'}
                </li>
              </ul>
            </div>

            {/* Required Documents */}
            <div className="mb-8">
              <h4 className="text-white font-bold text-sm mb-3">{t('requiredDocs')}</h4>
              {activeScheme.requiredDocuments && activeScheme.requiredDocuments.length > 0 ? (
                <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1.5">
                  {activeScheme.requiredDocuments.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">{t('noDocs')}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleDownload(activeScheme)}
                className="flex-grow bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>{t('downloadFormBtn')}</span>
              </button>
              
              {/* Only show Apply Online inside modal details if user profile eligibility matches or standard view */}
              <button
                onClick={() => { handleApplyOnline(activeScheme._id); setActiveScheme(null); }}
                className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors glow-btn text-sm"
              >
                <span>{t('applyOnlineBtn')}</span>
              </button>
              
              <button
                onClick={() => setActiveScheme(null)}
                className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-850 px-6 py-3 rounded-xl text-sm font-semibold"
              >
                {t('closeBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
