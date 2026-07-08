import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ArrowRight, BookOpen, UserCheck, BellRing, Download, Award, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    schemesCount: 6,
    announcementsCount: 3,
    downloadsCount: 284,
    citizensCount: 154
  });
  const [importantNotices, setImportantNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const schemeRes = await fetch(`${API_BASE_URL}/schemes`);
        const schemes = await schemeRes.json();
        
        const noticeRes = await fetch(`${API_BASE_URL}/announcements`);
        const notices = await noticeRes.json();
        
        const totalDownloads = schemes.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);
        
        const important = notices.filter(n => n.isImportant).slice(0, 2);
        setImportantNotices(important);

        const usersRes = await fetch(`${API_BASE_URL}/auth/users`, {}).catch(() => null);

        let usersCount = 154;
        if (usersRes && usersRes.ok) {
          const users = await usersRes.json();
          usersCount = users.filter(u => u.role === 'citizen').length;
        }

        setStats({
          schemesCount: schemes.length,
          announcementsCount: notices.length,
          downloadsCount: totalDownloads || 284,
          citizensCount: usersCount
        });
      } catch (err) {
        console.error('Error fetching home stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const categories = [
    { name: 'Animal Husbandry', desc: 'Poultry farm support, goat distribution, livestock subsidies.', icon: Award, color: 'text-amber-400' },
    { name: 'Agriculture', desc: 'Subsidies for seeds, organic farming, fertilizer distribution.', icon: Landmark, color: 'text-emerald-400' },
    { name: 'Housing & Shelter', desc: 'Rural housing development grants (PMAY-G) and renovations.', icon: Landmark, color: 'text-sky-400' },
    { name: 'Education', desc: 'Merit-based scholarships, book distribution, educational incentives.', icon: BookOpen, color: 'text-violet-400' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 max-w-7xl mx-auto w-full flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="inline-flex items-center space-x-2 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs md:text-sm px-4 py-1.5 rounded-full mb-6 font-medium pulse-glow">
          <BellRing className="h-4 w-4 shrink-0" />
          <span>{t('heroTagline')}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl">
          {t('heroTitle')}{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t('heroTitleHighlight')}
          </span>
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          {t('heroSubText')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/schemes"
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-8 py-3.5 rounded-xl font-bold glow-btn transition-all duration-300"
          >
            <span>{t('exploreSchemes')}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/schemes?check=1"
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300"
          >
            <UserCheck className="h-5 w-5 text-emerald-400" />
            <span>{t('checkEligibility')}</span>
          </Link>
        </div>
      </section>

      {/* Announcements Bar */}
      {importantNotices.length > 0 && (
        <section className="bg-emerald-950/20 border-y border-emerald-900/50 py-4 px-4 w-full">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 shrink-0">
              <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider animate-pulse">
                {t('important')}
              </span>
              <span className="text-slate-300 text-sm font-semibold">{t('latestNotices')}</span>
            </div>
            <div className="flex-grow overflow-hidden md:px-4">
              <div className="flex flex-col space-y-1">
                {importantNotices.map((notice) => (
                  <Link
                    key={notice._id}
                    to="/announcements"
                    className="text-slate-400 hover:text-emerald-400 text-sm truncate block transition-colors"
                  >
                    • {notice.title} <span className="text-slate-600 text-xs">({new Date(notice.date).toLocaleDateString()})</span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/announcements"
              className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center space-x-1 shrink-0"
            >
              <span>{t('viewNoticeBoard')}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="px-4 py-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <BookOpen className="h-8 w-8 text-emerald-400 mb-3" />
            <span className="text-3xl font-extrabold text-white mb-1">
              {loading ? '...' : stats.schemesCount}
            </span>
            <span className="text-xs md:text-sm text-slate-500 font-medium">{t('welfareSchemes')}</span>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <BellRing className="h-8 w-8 text-sky-400 mb-3" />
            <span className="text-3xl font-extrabold text-white mb-1">
              {loading ? '...' : stats.announcementsCount}
            </span>
            <span className="text-xs md:text-sm text-slate-500 font-medium">{t('panchayatNotices')}</span>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <Download className="h-8 w-8 text-amber-400 mb-3" />
            <span className="text-3xl font-extrabold text-white mb-1">
              {loading ? '...' : stats.downloadsCount}
            </span>
            <span className="text-xs md:text-sm text-slate-500 font-medium">{t('formsDownloaded')}</span>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <UserCheck className="h-8 w-8 text-teal-400 mb-3" />
            <span className="text-3xl font-extrabold text-white mb-1">
              {loading ? '...' : stats.citizensCount}
            </span>
            <span className="text-xs md:text-sm text-slate-500 font-medium">{t('registeredCitizens')}</span>
          </div>
        </div>
      </section>

      {/* Welfare Core Portals */}
      <section className="px-4 py-16 bg-slate-900/40 w-full border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">{t('browseByCategory')}</h2>
            <p className="text-sm text-slate-400">
              {t('browseSubText')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-6 rounded-2xl glass-card-hover transition-all duration-300"
                >
                  <div className="bg-slate-800/80 p-3 rounded-xl w-fit mb-4 border border-slate-700">
                    <Icon className={`h-6 w-6 ${cat.color}`} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {language === 'ml' 
                      ? (cat.name === 'Animal Husbandry' ? 'മൃഗസംരക്ഷണം' : cat.name === 'Agriculture' ? 'കൃഷി' : cat.name === 'Housing & Shelter' ? 'ഭവന നിർമ്മാണം' : 'വിദ്യാഭ്യാസം') 
                      : cat.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {language === 'ml'
                      ? (cat.name === 'Animal Husbandry' ? 'കോഴി വളർത്തൽ, ആട് വിതരണം, കാലിത്തീറ്റ സബ്‌സിഡികൾ.' : cat.name === 'Agriculture' ? 'വിത്തുകൾ, ജൈവകൃഷി, വളം വിതരണ സബ്‌സിഡികൾ.' : cat.name === 'Housing & Shelter' ? 'ഭവന നിർമ്മാണ ഗ്രാന്റുകളും (PMAY-G) പുനരുദ്ധാരണവും.' : 'മെറിറ്റ് സ്കോളർഷിപ്പുകൾ, പുസ്തക വിതരണം, വിദ്യാഭ്യാസ സഹായങ്ങൾ.')
                      : cat.desc}
                  </p>
                  <Link
                    to={`/schemes?category=${encodeURIComponent(cat.name)}`}
                    className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <span>{t('exploreSchemes')}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Informative Step Portal */}
      <section className="px-4 py-16 max-w-7xl mx-auto w-full">
        <div className="glass-card p-8 md:p-12 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-slate-800">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">{t('howToApply')}</h2>
            <div className="space-y-4">
              <div className="flex space-x-3">
                <div className="bg-emerald-500/20 text-emerald-400 font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/30 text-xs">1</div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{t('step1Title')}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t('step1Desc')}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="bg-emerald-500/20 text-emerald-400 font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/30 text-xs">2</div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{t('step2Title')}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t('step2Desc')}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="bg-emerald-500/20 text-emerald-400 font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/30 text-xs">3</div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{t('step3Title')}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t('step3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-white font-semibold text-lg mb-2">{t('needAssistance')}</h3>
            <p className="text-xs text-slate-400 text-center mb-6 max-w-xs leading-relaxed">
              {t('assistanceDesc')}
            </p>
            <div className="flex flex-col w-full space-y-2">
              <a
                href="mailto:helpdesk@panchayat.gov"
                className="w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                {t('emailSupport')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

