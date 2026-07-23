import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../context/AuthContext';
import { 
  User, Award, FileText, CalendarCheck, Clock, 
  ThumbsUp, ThumbsDown, CalendarPlus, ChevronRight, 
  Bell, HelpCircle, ArrowRight, ShieldCheck, LayoutDashboard 
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user, token } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [eligibleCount, setEligibleCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Stats
  const [stats, setStats] = useState({
    eligibleSchemes: 0,
    submittedApplications: 0,
    approvedApplications: 0,
    pendingAppointments: 0
  });

  useEffect(() => {
    if (!token || !user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch eligible schemes count
        const eligibilityRes = await fetch(`${API_BASE_URL}/schemes/check-eligibility`, {
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
        
        let eligibleSchemesList = [];
        if (eligibilityRes.ok) {
          const schemes = await eligibilityRes.json();
          eligibleSchemesList = schemes.filter(s => s.isEligible);
          setEligibleCount(eligibleSchemesList.length);
        }

        // 2. Fetch my applications
        const appsRes = await fetch(`${API_BASE_URL}/applications/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let myApps = [];
        if (appsRes.ok) {
          myApps = await appsRes.json();
          setApplications(myApps);
        }

        // 3. Fetch my appointments
        const apptsRes = await fetch(`${API_BASE_URL}/appointments/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let myAppts = [];
        if (apptsRes.ok) {
          myAppts = await apptsRes.json();
          setAppointments(myAppts);
        }

        // Set Stats
        const approvedApps = myApps.filter(app => app.status === 'Approved').length;
        const pendingAppts = myAppts.filter(appt => appt.status === 'Pending').length;

        setStats({
          eligibleSchemes: eligibleSchemesList.length,
          submittedApplications: myApps.length,
          approvedApplications: approvedApps,
          pendingAppointments: pendingAppts
        });

      } catch (err) {
        console.error('Error fetching citizen dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user]);

  const getStatusBadge = (status) => {
    const badges = {
      Approved: { className: 'badge badge-green', icon: <ThumbsUp size={11} /> },
      Confirmed: { className: 'badge badge-green', icon: <ThumbsUp size={11} /> },
      Rejected: { className: 'badge badge-red', icon: <ThumbsDown size={11} /> },
      Cancelled: { className: 'badge badge-red', icon: <ThumbsDown size={11} /> },
      'Under Review': { className: 'badge badge-amber', icon: <Clock size={11} /> },
      Pending: { className: 'badge badge-slate', icon: <Clock size={11} /> }
    };
    const s = badges[status] || badges['Pending'];
    return (
      <span className={s.className}>
        {s.icon} <span style={{ marginLeft: '0.2rem' }}>{status}</span>
      </span>
    );
  };

  const formattedDate = new Date().toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full space-y-8">
      
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(30,41,59,0.15)'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 250, height: 250, background: 'rgba(99,102,241,0.15)', borderRadius: '50%', filter: 'blur(50px)' }} className="hero-orb" />
        <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: 200, height: 200, background: 'rgba(59,130,246,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} className="hero-orb-delay" />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
            <LayoutDashboard size={14} color="#93c5fd" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {language === 'ml' ? 'പൗരൻ ഡാഷ്‌ബോർഡ്' : 'Citizen Dashboard'}
            </span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            {language === 'ml' ? `സ്വാഗതം, ${user?.name || 'പൗരൻ'}` : `Welcome back, ${user?.name || 'Citizen'}`}!
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 1.5rem', fontWeight: 500 }}>
            {formattedDate}
          </p>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {language === 'ml' ? 'വാർഷിക വരുമാനം' : 'Annual Income'}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>
                {(user?.annualIncome !== null && user?.annualIncome !== undefined && user?.annualIncome !== '') ? `₹${user.annualIncome}` : 'Not Specified'}
              </span>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)' }} className="hidden sm:block" />
            <div>
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {language === 'ml' ? 'വിഭാഗം' : 'Category'}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>
                {user?.category || 'Not Specified'}
              </span>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)' }} className="hidden sm:block" />
            <div>
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {language === 'ml' ? 'തൊഴിൽ' : 'Occupation'}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>
                {user?.occupation || 'Not Specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: language === 'ml' ? 'അർഹതയുള്ള പദ്ധതികൾ' : 'Eligible Schemes', 
            value: stats.eligibleSchemes, 
            icon: Award, 
            color: '#2563eb', 
            bg: '#dbeafe',
            link: '/schemes?eligible_only=1'
          },
          { 
            label: language === 'ml' ? 'സമർപ്പിച്ച അപേക്ഷകൾ' : 'Submitted Applications', 
            value: stats.submittedApplications, 
            icon: FileText, 
            color: '#7c3aed', 
            bg: '#ede9fe',
            link: '/profile'
          },
          { 
            label: language === 'ml' ? 'അംഗീകരിച്ച അപേക്ഷകൾ' : 'Approved Applications', 
            value: stats.approvedApplications, 
            icon: ThumbsUp, 
            color: '#16a34a', 
            bg: '#dcfce7',
            link: '/profile'
          },
          { 
            label: language === 'ml' ? 'അപ്പോയ്‌ന്റ്‌മെന്റുകൾ' : 'Appointments Status', 
            value: stats.pendingAppointments > 0 ? `${stats.pendingAppointments} Pending` : appointments.length, 
            icon: CalendarCheck, 
            color: '#d97706', 
            bg: '#fef9c3',
            link: '/profile'
          }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Link key={i} to={card.link} className="card p-5 flex items-center gap-4 text-decoration-none" style={{ color: 'inherit' }}>
              <div style={{ background: card.bg, borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                  {loading ? '…' : card.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 650, marginTop: '0.25rem' }}>
                  {card.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid for Actions, Applications, Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions & Help */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Quick Actions Card */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              {language === 'ml' ? 'ദ്രുത സേവനങ്ങൾ' : 'Quick Actions'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { 
                  title: language === 'ml' ? 'യോഗ്യത പദ്ധതികൾ കാണുക' : 'Check Match & Eligibility', 
                  desc: language === 'ml' ? 'അർഹതയുള്ള ക്ഷേമപദ്ധതികൾ കണ്ടെത്തുക' : 'Identify matching welfare schemes',
                  link: '/schemes?eligible_only=1',
                  color: '#2563eb',
                  bg: '#eff6ff',
                  icon: ShieldCheck
                },
                { 
                  title: language === 'ml' ? 'അപ്പോയ്‌ന്റ്‌മെന്റ് ബുക്കിംഗ്' : 'Book Office Appointment', 
                  desc: language === 'ml' ? 'ഓഫീസ് സന്ദർശനത്തിനായി സമയം തിരഞ്ഞെടുക്കുക' : 'Schedule a slot with the Secretary',
                  link: '/book-appointment',
                  color: '#16a34a',
                  bg: '#f0fdf4',
                  icon: CalendarPlus
                },
                { 
                  title: language === 'ml' ? 'പ്രൊഫൈൽ വിവരങ്ങൾ മാറ്റുക' : 'Edit Eligibility Profile', 
                  desc: language === 'ml' ? 'വരുമാനവും ജോലിയും അപ്‌ഡേറ്റ് ചെയ്യുക' : 'Configure age, income, category',
                  link: '/profile',
                  color: '#7c3aed',
                  bg: '#faf5ff',
                  icon: User
                },
                { 
                  title: language === 'ml' ? 'ഔദ്യോഗിക അറിയിപ്പുകൾ' : 'Panchayat Notice Board', 
                  desc: language === 'ml' ? 'പുതിയ സർക്കുലറുകളും അറിയിപ്പുകളും' : 'View latest files and announcements',
                  link: '/announcements',
                  color: '#d97706',
                  bg: '#fffbeb',
                  icon: Bell
                }
              ].map((act, idx) => {
                const ActIcon = act.icon;
                return (
                  <Link key={idx} to={act.link} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#fff', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#fff'; }}
                  >
                    <div style={{ background: act.bg, color: act.color, borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ActIcon size={18} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', margin: 0 }}>{act.title}</h4>
                      <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0' }}>{act.desc}</p>
                    </div>
                    <ChevronRight size={14} color="#94a3b8" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Need Assistance Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
            border: '1px solid #bfdbfe', 
            borderRadius: '20px', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <HelpCircle size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                {language === 'ml' ? 'സഹായം വേണോ?' : 'Need Assistance?'}
              </h3>
            </div>
            <p style={{ color: '#475569', fontSize: '0.78rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
              {language === 'ml'
                ? 'അപേക്ഷാ ഫോമുകൾ പൂരിപ്പിക്കുന്നതിനോ രേഖകൾ ശേഖരിക്കുന്നതിനോ സംശയമുണ്ടെങ്കിൽ പ്രവൃത്തിദിവസങ്ങളിൽ രാവിലെ 10 മുതൽ ഉച്ചയ്ക്ക് 2 വരെ സെക്രട്ടറി ഡെസ്ക് സന്ദർശിക്കുക.'
                : 'If you require support filling applications or have questions about eligibility requirements, please book an appointment or mail us.'}
            </p>
            <a href="mailto:support@panchayat.gov.in" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
              {language === 'ml' ? 'ഇമെയിൽ അയക്കുക' : 'Contact Support'} <ArrowRight size={13} />
            </a>
          </div>

        </div>

        {/* Right Column: Applications & Appointments lists */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Applications list */}
          <div className="glass-card p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="#7c3aed" />
                {language === 'ml' ? 'അപേക്ഷകളുടെ നില' : 'Online Welfare Applications'}
              </h2>
              <Link to="/profile" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                {language === 'ml' ? 'എല്ലാം കാണുക' : 'View Details'}
              </Link>
            </div>

            {loading ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                {language === 'ml' ? 'വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading application details...'}
              </p>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', border: '1.5px dashed #e2e8f0', borderRadius: '14px' }}>
                <FileText size={32} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1rem' }}>
                  {language === 'ml' ? 'നിങ്ങൾ അപേക്ഷകളൊന്നും സമർപ്പിച്ചിട്ടില്ല.' : 'You have not submitted any applications yet.'}
                </p>
                <Link to="/schemes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dbeafe', color: '#1d4ed8', border: 'none', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                  {language === 'ml' ? 'പദ്ധതികൾ പരിശോധിക്കുക' : 'Browse Schemes'}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {applications.slice(0, 3).map((app) => (
                  <div key={app._id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.62rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {app.scheme?.category || 'Scheme'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          📅 {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#334155', margin: 0 }}>
                        {app.scheme?.title}
                      </h4>
                      {app.remarks && (
                        <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#7c3aed', fontWeight: 650 }}>
                          {language === 'ml' ? 'ഓഫീസ് റിമാർക്ക്:' : 'Remark:'} {app.remarks}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                ))}
                {applications.length > 3 && (
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', margin: '0.5rem 0 0' }}>
                    {language === 'ml' 
                      ? `മറ്റു ${applications.length - 3} അപേക്ഷകൾ കൂടി നിങ്ങളുടെ പ്രൊഫൈൽ പേജിൽ ലഭ്യമാണ്.` 
                      : `And ${applications.length - 3} more applications are available in your Profile.`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Appointments list */}
          <div className="glass-card p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarCheck size={18} color="#d97706" />
                {language === 'ml' ? 'ബുക്ക് ചെയ്ത അപ്പോയ്‌ന്റ്‌മെന്റുകൾ' : 'My Scheduled Appointments'}
              </h2>
              <Link to="/book-appointment" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                <CalendarPlus size={13} />
                {language === 'ml' ? 'ബുക്ക് ചെയ്യൂ' : 'Book Slot'}
              </Link>
            </div>

            {loading ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                {language === 'ml' ? 'വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading appointments...'}
              </p>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <CalendarCheck size={32} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  {language === 'ml' ? 'അപ്പോയ്‌ന്റ്‌മെന്റുകൾ ഒന്നും ഇതുവരെ ബുക്ക് ചെയ്തിട്ടില്ല.' : 'No slots scheduled yet.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {appointments.slice(0, 2).map((appt) => (
                  <div key={appt._id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                          📅 {new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>· {appt.timeSlot}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                        {appt.purpose}
                      </p>
                      {appt.adminNote && (
                        <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#7c3aed', fontWeight: 650 }}>
                          {language === 'ml' ? 'ഓഫീസ് കുറിപ്പ്:' : 'Office Note:'} {appt.adminNote}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>
                ))}
                {appointments.length > 2 && (
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', margin: '0.5rem 0 0' }}>
                    {language === 'ml'
                      ? `മറ്റു ${appointments.length - 2} അപ്പോയ്‌ന്റ്‌മെന്റുകൾ കൂടി പ്രൊഫൈലിൽ കാണാം.`
                      : `And ${appointments.length - 2} more slots listed in your Profile.`}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
