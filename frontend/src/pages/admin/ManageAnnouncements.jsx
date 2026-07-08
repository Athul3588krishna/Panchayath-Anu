import React, { useEffect, useState } from 'react';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { Bell, Plus, Edit, Trash2, Save, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

const ManageAnnouncements = () => {
  const { token } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/announcements`);
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!title || !content) {
      return setFormError('Title and content are required fields.');
    }

    const noticeData = {
      title,
      content,
      isImportant
    };

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${API_BASE_URL}/announcements/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(noticeData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/announcements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(noticeData)
        });
      }

      if (response.ok) {
        setFormSuccess(isEditing ? 'Notice updated successfully!' : 'Notice published successfully!');
        resetForm();
        fetchNotices();
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Failed to submit notice.');
      }
    } catch (err) {
      setFormError('Network error submitting notice.');
    }
  };

  const handleEditClick = (notice) => {
    setIsEditing(true);
    setEditingId(notice._id);
    setTitle(notice.title || '');
    setContent(notice.content || '');
    setIsImportant(notice.isImportant || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Delete this announcement notice?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setFormSuccess('Notice removed successfully.');
        fetchNotices();
      }
    } catch (err) {
      setFormError('Error removing notice.');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsImportant(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Publish Notice board</h1>
            <p className="text-slate-400 text-sm">Post announcements, news updates, meeting alerts, and local rules to the public notice board.</p>
          </div>
        </div>
        {isEditing && (
          <button
            onClick={resetForm}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {formSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-950 text-emerald-350 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{formSuccess}</span>
        </div>
      )}

      {formError && (
        <div className="bg-rose-950/40 border border-rose-950 text-rose-305 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      {/* Notice form */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800">
        <h3 className="text-white font-bold text-lg mb-6">
          {isEditing ? 'Modify Published Bulletin' : 'Draft New Bulletin'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-350 text-xs font-semibold mb-2">Notice Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Gram Sabha quarterly meeting schedules"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-350 text-xs font-semibold mb-2">Notice Content (Markdown / Text) *</label>
            <textarea
              required
              rows={6}
              placeholder="Enter detailed notice content. This will be visible to all visitors..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 w-fit">
            <input
              type="checkbox"
              id="notice-priority"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="notice-priority" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Mark notice as high priority (flashes alert badge)
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors glow-btn text-sm"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? 'Save Notice' : 'Publish Notice'}</span>
          </button>
        </form>
      </div>

      {/* Bulletins list */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg">Published Bulletins ({notices.length})</h3>
        {loading ? (
          <p className="text-slate-500 text-center py-6">Loading notices...</p>
        ) : notices.length === 0 ? (
          <p className="text-slate-505 text-center py-6">No notices published.</p>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <div key={n._id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      <Calendar className="h-3 w-3 mr-1 text-emerald-500" />
                      {new Date(n.date).toLocaleDateString()}
                    </span>
                    {n.isImportant && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Important
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-bold text-sm">{n.title}</h4>
                  <p className="text-slate-500 text-xs line-clamp-1">{n.content}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleEditClick(n)}
                    className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 p-2 rounded-lg"
                    title="Edit notice details"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(n._id)}
                    className="bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 p-2 rounded-lg"
                    title="Delete notice"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageAnnouncements;
