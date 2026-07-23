import React, { useEffect, useState } from 'react';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { Users, Trash2, Edit, Save, Shield, User, X, CheckCircle, AlertCircle } from 'lucide-react';

const ManageUsers = () => {
  const { token, user: loggedUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('citizen');
  const [age, setAge] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [occupation, setOccupation] = useState('');
  const [category, setCategory] = useState('');

  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleEditClick = (u) => {
    setIsEditing(true);
    setEditingId(u._id);
    setName(u.name || '');
    setEmail(u.email || '');
    setRole(u.role || 'citizen');
    setAge(u.age !== null ? String(u.age) : '');
    setAnnualIncome(u.annualIncome !== null ? String(u.annualIncome) : '');
    setOccupation(u.occupation || '');
    setCategory(u.category || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (id === loggedUser._id) {
      return setFeedbackError('Cannot delete your own admin account.');
    }
    if (!window.confirm('Delete this user account? This cannot be undone.')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setFeedbackSuccess('User account removed successfully.');
        fetchUsers();
      } else {
        const errData = await res.json();
        setFeedbackError(errData.message || 'Failed to delete user.');
      }
    } catch (err) {
      setFeedbackError('Error deleting user.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedbackSuccess('');
    setFeedbackError('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          role,
          age: age ? Number(age) : null,
          annualIncome: annualIncome ? Number(annualIncome) : null,
          occupation,
          category
        })
      });

      if (res.ok) {
        setFeedbackSuccess('User profile details updated.');
        setIsEditing(false);
        setEditingId(null);
        fetchUsers();
      } else {
        const data = await res.json();
        setFeedbackError(data.message || 'Failed to update user profile.');
      }
    } catch (err) {
      setFeedbackError('Error updating profile.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">User Directory</h1>
            <p className="text-slate-400 text-sm">Monitor registered citizens, modify profile details for eligibility assistance, and adjust account credentials.</p>
          </div>
        </div>
        {isEditing && (
          <button
            onClick={() => { setIsEditing(false); setEditingId(null); }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Cancel Edit
          </button>
        )}
      </div>

      
      {feedbackSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-950 text-emerald-350 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {feedbackError && (
        <div className="bg-rose-950/40 border border-rose-950 text-rose-305 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{feedbackError}</span>
        </div>
      )}

      
      {isEditing && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800">
          <h3 className="text-white font-bold text-lg mb-6">Edit Profile for {name}</h3>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                >
                  <option value="citizen">Citizen</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Screening Credentials</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-305 text-xs font-semibold mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-305 text-xs font-semibold mb-2">Annual Income (₹)</label>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-305 text-xs font-semibold mb-2">Occupation</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                  >
                    <option value="">Select Occupation</option>
                    {occupationsList.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-305 text-xs font-semibold mb-2">Social Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
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

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors glow-btn text-sm"
            >
              <Save className="h-4 w-4" />
              <span>Save Profile Configuration</span>
            </button>
          </form>
        </div>
      )}

      
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h3 className="text-white font-bold text-lg mb-4">Registered Accounts</h3>
        
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-slate-500 text-center py-6">Fetching user records...</p>
          ) : users.length === 0 ? (
            <p className="text-slate-505 text-center py-6">No user accounts found.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5 text-center">Age</th>
                  <th className="py-2.5 text-center">Income</th>
                  <th className="py-2.5">Occupation</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-350">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-semibold text-white">{u.name}</td>
                    <td className="py-3 text-slate-400">{u.email}</td>
                    <td className="py-3">
                      {u.role === 'admin' ? (
                        <span className="flex items-center text-amber-400 font-semibold space-x-0.5">
                          <Shield className="h-3 w-3 shrink-0" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-slate-400 space-x-0.5">
                          <User className="h-3 w-3 shrink-0" />
                          <span>Citizen</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center">{u.age !== null ? u.age : '—'}</td>
                    <td className="py-3 text-center">{u.annualIncome !== null ? `₹${u.annualIncome}` : '—'}</td>
                    <td className="py-3 text-slate-400">{u.occupation || '—'}</td>
                    <td className="py-3 font-medium text-white">{u.category || '—'}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-850 p-1.5 rounded-lg"
                          title="Edit Profile"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u._id)}
                          className="bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-850 p-1.5 rounded-lg"
                          title="Delete Account"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default ManageUsers;
