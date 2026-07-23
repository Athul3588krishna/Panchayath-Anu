import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { ShieldCheck, Users, BookOpen, Bell, FileText, CheckCircle, Clock, ThumbsUp, ThumbsDown, Edit2, Check, X, CalendarCheck, TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ citizensCount: 0, schemesCount: 0, announcementsCount: 0, applicationsCount: 0, appointmentsCount: 0 });
  const [applications, setApplications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [apptLoading, setApptLoading] = useState(true);
  const [editingAppId, setEditingAppId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [editingApptId, setEditingApptId] = useState(null);
  const [editApptStatus, setEditApptStatus] = useState('');
  const [editApptNote, setEditApptNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  
  const [appsByScheme, setAppsByScheme] = useState([]);
  const [appsByStatus, setAppsByStatus] = useState([]);
  const [registrationsByMonth, setRegistrationsByMonth] = useState([]);

  const fetchAll = async () => {
    try {
      const [usersRes, schemesRes, noticesRes, appsRes, apptsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/schemes`),
        fetch(`${API_BASE_URL}/announcements`),
        fetch(`${API_BASE_URL}/applications`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/appointments`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const schemes = schemesRes.ok ? await schemesRes.json() : [];
      const notices = noticesRes.ok ? await noticesRes.json() : [];
      const apps = appsRes.ok ? await appsRes.json() : [];
      const appts = apptsRes.ok ? await apptsRes.json() : [];

      const citizens = users.filter(u => u.role === 'citizen');
      setApplications(apps);
      setAppointments(appts);

      setStats({
        citizensCount: citizens.length,
        schemesCount: schemes.length,
        announcementsCount: notices.length,
        applicationsCount: apps.length,
        appointmentsCount: appts.length
      });

      

      
      const schemeCounts = {};
      apps.forEach(app => {
        const name = app.scheme?.title || 'Unknown';
        const short = name.length > 20 ? name.slice(0, 18) + '…' : name;
        schemeCounts[short] = (schemeCounts[short] || 0) + 1;
      });
      setAppsByScheme(Object.entries(schemeCounts).map(([name, count]) => ({ name, Applications: count })));

      
      const statusCounts = { Pending: 0, 'Under Review': 0, Approved: 0, Rejected: 0 };
      apps.forEach(app => { if (statusCounts[app.status] !== undefined) statusCounts[app.status]++; });
      setAppsByStatus(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      
      const monthCounts = {};
      citizens.forEach(u => {
        const d = new Date(u.createdAt || Date.now());
        const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      });
      const sorted = Object.entries(monthCounts).map(([month, count]) => ({ month, Citizens: count }));
      setRegistrationsByMonth(sorted.length > 0 ? sorted : [{ month: 'Now', Citizens: citizens.length }]);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setAppsLoading(false);
      setApptLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [token]);

  const handleUpdateAppStatus = async (appId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: editStatus, remarks: editRemarks })
      });
      if (res.ok) { setFeedback({ type: 'success', text: 'Application status updated.' }); setEditingAppId(null); fetchAll(); }
      else setFeedback({ type: 'error', text: 'Update failed.' });
    } catch (e) { setFeedback({ type: 'error', text: 'Network error.' }); }
  };

  const handleUpdateApptStatus = async (apptId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${apptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: editApptStatus, adminNote: editApptNote })
      });
      if (res.ok) { setFeedback({ type: 'success', text: 'Appointment updated.' }); setEditingApptId(null); fetchAll(); }
      else setFeedback({ type: 'error', text: 'Update failed.' });
    } catch (e) { setFeedback({ type: 'error', text: 'Network error.' }); }
  };

  const statusBadge = (status) => {
    const map = {
      'Approved':     { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', icon: <ThumbsUp size={11} /> },
      'Rejected':     { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', icon: <ThumbsDown size={11} /> },
      'Under Review': { bg: '#fef9c3', color: '#a16207', border: '#fde68a', icon: <Clock size={11} /> },
      'Confirmed':    { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', icon: <CheckCircle size={11} /> },
      'Cancelled':    { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', icon: <X size={11} /> },
      'Pending':      { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', icon: <Clock size={11} /> },
    };
    const s = map[status] || map['Pending'];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '999px', padding: '0.22rem 0.65rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
        {s.icon} {status}
      </span>
    );
  };

  const adminModules = [
    { title: 'Welfare Schemes', desc: 'Manage schemes, criteria, and deadlines.', link: '/admin/schemes', icon: BookOpen, color: '#2563eb', bg: '#dbeafe' },
    { title: 'Publish Notices', desc: 'Post circulars and announcements.', link: '/admin/announcements', icon: Bell, color: '#7c3aed', bg: '#ede9fe' },
    { title: 'User Directory', desc: 'Manage registered citizens.', link: '/admin/users', icon: Users, color: '#d97706', bg: '#fef9c3' },
    { title: 'Export Reports', desc: 'Download CSV/analytics reports.', link: '/admin/reports', icon: FileText, color: '#0891b2', bg: '#e0f2fe' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>

      
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={22} color="#d97706" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Administrator Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Smart Panchayat — System Overview & Management</p>
        </div>
      </div>

      {feedback.text && (
        <div style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`, color: feedback.type === 'success' ? '#15803d' : '#b91c1c' }}>
          <CheckCircle size={16} /> {feedback.text}
          <button onClick={() => setFeedback({ type: '', text: '' })} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
        {[
          { label: 'Registered Citizens', value: stats.citizensCount, icon: Users, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Active Schemes', value: stats.schemesCount, icon: BookOpen, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Notices Published', value: stats.announcementsCount, icon: Bell, color: '#d97706', bg: '#fef9c3' },
          { label: 'Online Applications', value: stats.applicationsCount, icon: FileText, color: '#0891b2', bg: '#e0f2fe' },
          { label: 'Appointments', value: stats.appointmentsCount, icon: CalendarCheck, color: '#16a34a', bg: '#dcfce7' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: bg, borderRadius: '10px', padding: '0.6rem', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{loading ? '…' : value}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <TrendingUp size={18} color="#2563eb" />
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Analytics Overview</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <BarChart2 size={14} color="#2563eb" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applications per Scheme</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={appsByScheme} margin={{ top: 0, right: 0, left: -25, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="Applications" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <PieIcon size={14} color="#7c3aed" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approval vs Rejection Rate</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={appsByStatus} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={false} fontSize={9}>
                  {appsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#94a3b8', '#f59e0b', '#16a34a', '#dc2626'][index] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Tooltip contentStyle={{ fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <TrendingUp size={14} color="#16a34a" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Registrations</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={registrationsByMonth} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="Citizens" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
        {adminModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.link} to={mod.link} style={{ textDecoration: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', transition: 'all 0.2s ease', display: 'block' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ background: mod.bg, borderRadius: '10px', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Icon size={18} color={mod.color} />
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>{mod.title}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{mod.desc}</p>
            </Link>
          );
        })}
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <CalendarCheck size={18} color="#16a34a" />
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Appointment Requests</h2>
        </div>
        {apptLoading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>No appointments booked yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {appointments.map(appt => (
              <div key={appt._id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{appt.user?.name || 'Citizen'}</span>
                      {statusBadge(appt.status)}
                    </div>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.82rem', color: '#64748b' }}>📅 {new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · 🕐 {appt.timeSlot}</p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>Purpose: <strong>{appt.purpose}</strong></p>
                    {appt.adminNote && <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600 }}>Note: {appt.adminNote}</p>}
                  </div>
                  <div>
                    {editingApptId === appt._id ? (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <select value={editApptStatus} onChange={e => setEditApptStatus(e.target.value)} style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#334155', outline: 'none' }}>
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Cancelled</option>
                        </select>
                        <input type="text" placeholder="Admin note..." value={editApptNote} onChange={e => setEditApptNote(e.target.value)} style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#334155', outline: 'none', width: 160 }} />
                        <button onClick={() => handleUpdateApptStatus(appt._id)} style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', cursor: 'pointer' }}><Check size={14} /></button>
                        <button onClick={() => setEditingApptId(null)} style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingApptId(appt._id); setEditApptStatus(appt.status); setEditApptNote(appt.adminNote || ''); }} style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', background: '#fff', border: '1.5px solid #e2e8f0', color: '#334155', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Edit2 size={13} /> Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <FileText size={18} color="#2563eb" />
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Citizen Online Application Logs</h2>
        </div>
        {appsLoading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>No applications submitted yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {applications.map(app => (
              <div key={app._id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '999px', padding: '0.15rem 0.6rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{app.scheme?.category}</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{app.scheme?.title}</span>
                    </div>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.82rem', color: '#64748b' }}>
                      Applicant: <strong style={{ color: '#334155' }}>{app.user?.name}</strong> · {app.user?.email}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                      Age: {app.user?.age || 'N/A'} · Income: {app.user?.annualIncome ? `₹${app.user.annualIncome}` : 'N/A'} · {app.user?.occupation || 'N/A'} · {app.user?.category || 'N/A'}
                    </p>
                    {app.remarks && <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600 }}>Remarks: {app.remarks}</p>}
                  </div>
                  <div>
                    {editingAppId === app._id ? (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#334155', outline: 'none' }}>
                          <option>Pending</option><option>Under Review</option><option>Approved</option><option>Rejected</option>
                        </select>
                        <input type="text" placeholder="Add remarks..." value={editRemarks} onChange={e => setEditRemarks(e.target.value)} style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#334155', outline: 'none', width: 160 }} />
                        <button onClick={() => handleUpdateAppStatus(app._id)} style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', cursor: 'pointer' }}><Check size={14} /></button>
                        <button onClick={() => setEditingAppId(null)} style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}><X size={14} /></button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {statusBadge(app.status)}
                        <button onClick={() => { setEditingAppId(app._id); setEditStatus(app.status); setEditRemarks(app.remarks || ''); }} style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', background: '#fff', border: '1.5px solid #e2e8f0', color: '#334155', cursor: 'pointer' }}><Edit2 size={13} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
