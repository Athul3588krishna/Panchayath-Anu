import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, AlertCircle, Save, CheckCircle, Award, Calendar, FileText, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { API_BASE_URL } from '../context/AuthContext';

const Profile = () => {
  const { user, token, updateProfile } = useAuth();
  const { t, language } = useLanguage();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [occupation, setOccupation] = useState('');
  const [category, setCategory] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [eligibleCount, setEligibleCount] = useState(0);

  // Online Applications State
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAge(user.age !== null ? String(user.age) : '');
      setAnnualIncome(user.annualIncome !== null ? String(user.annualIncome) : '');
      setOccupation(user.occupation || '');
      setCategory(user.category || '');
    }
  }, [user]);

  // Fetch count of eligible schemes
  useEffect(() => {
    const checkCount = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_BASE_URL}/schemes/check-eligibility`, {
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
        });
        if (res.ok) {
          const data = await res.json();
          const count = data.filter(s => s.isEligible).length;
          setEligibleCount(count);
        }
      } catch (err) {
        console.error('Error calculating eligibility count:', err);
      }
    };
    checkCount();
  }, [user]);

  // Fetch citizen applications
  const fetchMyApplications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/applications/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      return setErrorMsg(language === 'ml' ? 'പാസ്‌വേഡുകൾ ഒരുപോലെയല്ല.' : 'Passwords do not match.');
    }

    setLoading(true);
    try {
      const updateData = {
        name,
        email,
        age: age ? Number(age) : null,
        annualIncome: annualIncome ? Number(annualIncome) : null,
        occupation: occupation || '',
        category: category || ''
      };

      if (password) {
        updateData.password = password;
      }

      await updateProfile(updateData);
      setSuccessMsg(language === 'ml' ? 'പ്രൊഫൈൽ വിജയകരമായി പുതുക്കി!' : 'Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

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

  // Helper for status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="flex items-center space-x-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            <ThumbsUp className="h-3 w-3" />
            <span>Approved</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center space-x-1 bg-rose-950/80 border border-rose-500/40 text-rose-450 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            <ThumbsDown className="h-3 w-3" />
            <span>Rejected</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="flex items-center space-x-1 bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            <span>Under Review</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left panel - Eligibility Summary */}
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
          <div className="bg-slate-800 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <User className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
          <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-900">
            {language === 'ml' ? 'രജിസ്റ്റർ ചെയ്ത പൗരൻ' : 'Citizen Profile'}
          </span>
          <p className="text-slate-500 text-xs mt-3">
            {language === 'ml' ? 'രജിസ്റ്റർ ചെയ്ത തിയതി:' : 'Registered on'} {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-emerald-950/20 to-slate-900/50">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="h-6 w-6 text-emerald-400 shrink-0" />
            <h3 className="text-white font-bold text-lg">{language === 'ml' ? 'യോഗ്യതാ വിവരങ്ങൾ' : 'Eligibility Summary'}</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            {language === 'ml' 
              ? 'നിങ്ങൾ നൽകിയിട്ടുള്ള പ്രൊഫൈൽ വിവരങ്ങൾ പ്രകാരം അർഹതയുള്ളവ:'
              : 'Based on your currently configured parameters, you qualify for:'}
          </p>
          <div className="text-center py-4 bg-slate-900/40 rounded-2xl border border-slate-850 mb-6">
            <span className="text-5xl font-black text-emerald-400">{eligibleCount}</span>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              {language === 'ml' ? 'അർഹതയുള്ളവ' : 'Eligible Schemes'}
            </p>
          </div>
          <a
            href="/schemes?eligible_only=1"
            className="w-full text-center block bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition-colors text-sm glow-btn"
          >
            {t('checkEligibility')}
          </a>
        </div>
      </div>

      {/* Right panel - Edit Profile & Application List */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Profile Settings */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800">
          <h3 className="text-white font-bold text-xl mb-6">{t('interactiveScreening')}</h3>

          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-950 text-emerald-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-950 text-rose-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-350 text-xs font-semibold mb-2">
                  {language === 'ml' ? 'പൂർണ്ണനാമം' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-350 text-xs font-semibold mb-2">
                  {language === 'ml' ? 'ഇമെയിൽ വിലാസം' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                {language === 'ml' ? 'യോഗ്യതാ വിവരങ്ങൾ പുതുക്കുക' : 'Update Screening Profile'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 text-xs font-semibold mb-2">
                    {language === 'ml' ? 'പ്രായം (വർഷം)' : 'Age (years)'}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-350 text-xs font-semibold mb-2">
                    {language === 'ml' ? 'വാർഷിക കുടുംബ വരുമാനം (₹)' : 'Annual Household Income (₹)'}
                  </label>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-355 text-xs font-semibold mb-2">
                    {language === 'ml' ? 'ജോലി' : 'Occupation'}
                  </label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none"
                  >
                    <option value="">Select Occupation</option>
                    {occupationsList.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-355 text-xs font-semibold mb-2">
                    {language === 'ml' ? 'സാമൂഹിക വിഭാഗം' : 'Social Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                {language === 'ml' ? 'പാസ്‌വേഡ് മാറ്റുക' : 'Change Password'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 text-xs font-semibold mb-2">
                    {language === 'ml' ? 'പുതിയ പാസ്‌വേഡ്' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-350 text-xs font-semibold mb-2">
                    {language === 'ml' ? 'വീണ്ടും ടൈപ്പ് ചെയ്യുക' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors glow-btn text-sm"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? (language === 'ml' ? 'മാറ്റങ്ങൾ വരുത്തുന്നു...' : 'Saving Updates...') : (language === 'ml' ? 'മാറ്റങ്ങൾ സൂക്ഷിക്കുക' : 'Save Profile Changes')}</span>
            </button>
          </form>
        </div>

        {/* Online Applications Tracker */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-emerald-450" />
            <span>{language === 'ml' ? 'ഓൺലൈൻ അപേക്ഷകളുടെ നില' : 'Online Application Status'}</span>
          </h3>
          <p className="text-slate-400 text-xs mb-6">
            {language === 'ml' 
              ? 'ഈ വെബ് പോർട്ടൽ വഴി ഓൺലൈനായി നിങ്ങൾ സമർപ്പിച്ചിട്ടുള്ള അപേക്ഷകളുടെ നില പരിശോധിക്കുക.'
              : 'Track progress and status checks of online welfare applications submitted under your account.'}
          </p>

          {appsLoading ? (
            <p className="text-slate-500 text-center py-6 text-xs">{language === 'ml' ? 'വിവരങ്ങൾ എടുക്കുന്നു...' : 'Fetching application history...'}</p>
          ) : applications.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 border border-slate-850 rounded-2xl">
              <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">{language === 'ml' ? 'നിങ്ങൾ ഓൺലൈനായി അപേക്ഷകളൊന്നും സമർപ്പിച്ചിട്ടില്ല.' : 'You have not submitted any online applications yet.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <span className="bg-slate-850 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      {app.scheme?.category || 'General'}
                    </span>
                    <h4 className="text-white font-bold text-sm md:text-base">{app.scheme?.title || 'Welfare Scheme'}</h4>
                    
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 pt-1 font-semibold uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{language === 'ml' ? 'സമർപ്പിച്ചത്' : 'Applied:'} {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>

                    {app.remarks && (
                      <div className="mt-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 text-xs">
                        <p className="text-[10px] text-amber-500 font-bold uppercase">{language === 'ml' ? 'റിമാർക്കുകൾ (സെക്രട്ടറി)' : 'Remarks (Secretary):'}</p>
                        <p className="text-slate-400 mt-0.5">{app.remarks}</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
