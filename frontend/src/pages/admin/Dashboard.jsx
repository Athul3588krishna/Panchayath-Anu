import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { ShieldCheck, Users, BookOpen, Bell, Download, Award, FileText, CheckCircle, Clock, ThumbsUp, ThumbsDown, Edit2, Check, X } from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    citizensCount: 0,
    schemesCount: 0,
    announcementsCount: 0,
    applicationsCount: 0
  });
  const [schemes, setSchemes] = useState([]);
  
  // Applications management state
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [editingAppId, setEditingAppId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRemarks, setEditRemarks] = useState('');

  const [loading, setLoading] = useState(true);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const fetchAdminStats = async () => {
    try {
      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = await usersRes.json();
      const citizens = users.filter(u => u.role === 'citizen').length;

      // Fetch schemes
      const schemesRes = await fetch(`${API_BASE_URL}/schemes`);
      const schemesData = await schemesRes.json();
      setSchemes(schemesData);

      // Fetch notices
      const noticesRes = await fetch(`${API_BASE_URL}/announcements`);
      const notices = await noticesRes.json();

      // Fetch all applications
      const appsRes = await fetch(`${API_BASE_URL}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const apps = await appsRes.json();
      setApplications(apps);
      setAppsLoading(false);

      setStats({
        citizensCount: citizens,
        schemesCount: schemesData.length,
        announcementsCount: notices.length,
        applicationsCount: apps.length
      });
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, [token]);

  // Handle application status update
  const handleUpdateStatus = async (appId) => {
    setFeedbackSuccess('');
    setFeedbackError('');
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editStatus,
          remarks: editRemarks
        })
      });

      if (res.ok) {
        setFeedbackSuccess('Application status updated successfully!');
        setEditingAppId(null);
        fetchAdminStats();
      } else {
        setFeedbackError('Failed to update status.');
      }
    } catch (err) {
      setFeedbackError('Error connecting to backend.');
    }
  };

  const startEditing = (app) => {
    setEditingAppId(app._id);
    setEditStatus(app.status);
    setEditRemarks(app.remarks || '');
  };

  const adminModules = [
    { title: 'Welfare Schemes', desc: 'Create, update, or remove schemes & set criteria.', link: '/admin/schemes', icon: BookOpen, color: 'text-emerald-400' },
    { title: 'Publish Notices', desc: 'Post circulars, warnings, and announcements.', link: '/admin/announcements', icon: Bell, color: 'text-sky-400' },
    { title: 'User Directory', desc: 'Monitor registered citizens and edit eligibility profiles.', link: '/admin/users', icon: Users, color: 'text-violet-400' },
    { title: 'Analytics Reports', desc: 'Generate CSV/PDF summaries of views & form downloads.', link: '/admin/reports', icon: FileText, color: 'text-amber-400' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Administrator Dashboard</h1>
          <p className="text-slate-400 text-sm">Centralized administration for Smart Panchayat schemes, notices, and citizen submissions.</p>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {feedbackError && (
        <div className="bg-rose-950/40 border border-rose-900 text-rose-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Clock className="h-4 w-4 shrink-0 text-rose-450" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4 border border-slate-800">
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-emerald-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Registered Citizens</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{loading ? '...' : stats.citizensCount}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4 border border-slate-800">
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-sky-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Schemes</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{loading ? '...' : stats.schemesCount}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4 border border-slate-800">
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-amber-400">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Notices Published</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{loading ? '...' : stats.announcementsCount}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4 border border-slate-800">
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-teal-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Online Applications</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{loading ? '...' : stats.applicationsCount}</h3>
          </div>
        </div>
      </div>

      {/* Modules Menu */}
      <div className="space-y-4">
        <h2 className="text-white font-bold text-lg">System Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                to={mod.link}
                className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 flex flex-col justify-between group transition-all duration-300"
              >
                <div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg w-fit border border-slate-850 mb-4">
                    <Icon className={`h-5 w-5 ${mod.color}`} />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">{mod.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{mod.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Manage Online Applications Panel */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h2 className="text-white font-bold text-lg mb-2">Citizen Online Application Logs</h2>
        <p className="text-slate-400 text-xs mb-6">Review eligibility qualifications and update application verification states.</p>

        {appsLoading ? (
          <p className="text-slate-500 text-center py-6 text-xs">Loading application data...</p>
        ) : applications.length === 0 ? (
          <p className="text-slate-500 text-center py-6 text-xs">No online applications submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <span className="bg-slate-850 text-slate-400 text-[9px] font-bold px-2.5 py-0.5 rounded border border-slate-800 uppercase">
                      {app.scheme?.category || 'General'}
                    </span>
                    <h3 className="text-white font-bold text-base md:text-lg">{app.scheme?.title || 'Welfare Scheme'}</h3>
                    
                    {/* Applicant Profile info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-450 pt-1">
                      <span className="font-semibold text-slate-300">Applicant: {app.user?.name} ({app.user?.email})</span>
                      <span>• Age: {app.user?.age || 'N/A'}</span>
                      <span>• Income: {app.user?.annualIncome ? `₹${app.user.annualIncome}` : 'N/A'}</span>
                      <span>• Job: {app.user?.occupation || 'N/A'}</span>
                      <span>• Caste: {app.user?.category || 'N/A'}</span>
                    </div>
                  </div>

                  {editingAppId === app._id ? (
                    /* Inline Editor Controls */
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto pt-2">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 py-1.5 px-3 outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        value={editRemarks}
                        onChange={(e) => setEditRemarks(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-350 py-1.5 px-3 outline-none flex-grow"
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => handleUpdateStatus(app._id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-2 rounded-lg"
                          title="Save Changes"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingAppId(null)}
                          className="bg-slate-800 hover:bg-slate-750 text-slate-400 p-2 rounded-lg"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Info Badge & Action Button */
                    <div className="flex items-center space-x-3 shrink-0 pt-2 md:pt-0">
                      <div>
                        {app.status === 'Approved' ? (
                          <span className="flex items-center space-x-1 bg-emerald-950 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border border-emerald-900">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>Approved</span>
                          </span>
                        ) : app.status === 'Rejected' ? (
                          <span className="flex items-center space-x-1 bg-rose-950 text-rose-455 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border border-rose-900">
                            <ThumbsDown className="h-3.5 w-3.5" />
                            <span>Rejected</span>
                          </span>
                        ) : app.status === 'Under Review' ? (
                          <span className="flex items-center space-x-1 bg-amber-950 text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border border-amber-900">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Under Review</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 bg-slate-950 text-slate-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border border-slate-850">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => startEditing(app)}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 p-2 rounded-lg text-xs font-semibold flex items-center space-x-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {app.remarks && !editingAppId && (
                  <div className="mt-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 text-xs">
                    <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wide">Remarks:</span>
                    <p className="text-slate-400 mt-0.5">{app.remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
