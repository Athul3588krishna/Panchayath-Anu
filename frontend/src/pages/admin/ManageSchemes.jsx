import React, { useEffect, useState } from 'react';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { BookOpen, Edit, Trash2, Save, PlusCircle, MinusCircle, FileText, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import CountdownBadge from '../../components/CountdownBadge';

const ManageSchemes = () => {
  const { token } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Scheme form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Agriculture');
  
  const [minAge, setMinAge] = useState('0');
  const [maxAge, setMaxAge] = useState('120');
  const [maxIncome, setMaxIncome] = useState('');
  const [allowedOccString, setAllowedOccString] = useState('');
  const [allowedCatList, setAllowedCatList] = useState([]); // General, OBC, SC, ST

  const [docInputs, setDocInputs] = useState(['']);
  const [expiresAt, setExpiresAt] = useState(''); // YYYY-MM-DD string or ''

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedPath, setUploadedPath] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const categories = ['Agriculture', 'Animal Husbandry', 'Housing', 'Education', 'Social Welfare', 'Health', 'Employment'];
  const socialCategories = ['General', 'OBC', 'SC', 'ST'];

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/schemes`);
      if (res.ok) {
        const data = await res.json();
        setSchemes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleCategoryCheckbox = (cat) => {
    if (allowedCatList.includes(cat)) {
      setAllowedCatList(prev => prev.filter(c => c !== cat));
    } else {
      setAllowedCatList(prev => [...prev, cat]);
    }
  };

  // Dynamic document actions
  const addDocField = () => setDocInputs(prev => [...prev, '']);
  const removeDocField = (idx) => {
    if (docInputs.length > 1) {
      setDocInputs(prev => prev.filter((_, i) => i !== idx));
    }
  };
  const handleDocChange = (idx, value) => {
    const next = [...docInputs];
    next[idx] = value;
    setDocInputs(next);
  };

  // Upload file to Express upload endpoint
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFormError('');
    setFormSuccess('');

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setUploadedPath(data.filepath);
        setFormSuccess('Application form uploaded successfully!');
      } else {
        setFormError(data.message || 'File upload failed.');
      }
    } catch (err) {
      setFormError('Network error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  // Form submission: Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!title || !description || !category) {
      return setFormError('Title, description and category are required.');
    }

    // Clean dynamic doc list
    const requiredDocs = docInputs.filter(d => d.trim() !== '');

    // Parse target occupations
    const allowedOccupations = allowedOccString
      ? allowedOccString.split(',').map(o => o.trim()).filter(o => o !== '')
      : [];

    const schemeData = {
      title,
      description,
      category,
      eligibilityCriteria: {
        minAge: minAge ? Number(minAge) : 0,
        maxAge: maxAge ? Number(maxAge) : 150,
        maxIncome: maxIncome ? Number(maxIncome) : null,
        allowedOccupations,
        allowedCategories: allowedCatList
      },
      requiredDocuments,
      formUrl: uploadedPath,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
    };

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${API_BASE_URL}/schemes/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(schemeData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/schemes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(schemeData)
        });
      }

      if (response.ok) {
        setFormSuccess(isEditing ? 'Scheme updated successfully!' : 'Welfare scheme created successfully!');
        resetForm();
        fetchSchemes();
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Failed to submit scheme.');
      }
    } catch (err) {
      setFormError('Network error submitting scheme details.');
    }
  };

  const handleEditClick = (scheme) => {
    setIsEditing(true);
    setEditingId(scheme._id);
    setTitle(scheme.title || '');
    setDescription(scheme.description || '');
    setCategory(scheme.category || 'Agriculture');
    setMinAge(scheme.eligibilityCriteria?.minAge !== undefined ? String(scheme.eligibilityCriteria.minAge) : '0');
    setMaxAge(scheme.eligibilityCriteria?.maxAge !== undefined ? String(scheme.eligibilityCriteria.maxAge) : '120');
    setMaxIncome(scheme.eligibilityCriteria?.maxIncome !== null && scheme.eligibilityCriteria?.maxIncome !== undefined ? String(scheme.eligibilityCriteria.maxIncome) : '');
    setAllowedOccString(scheme.eligibilityCriteria?.allowedOccupations ? scheme.eligibilityCriteria.allowedOccupations.join(', ') : '');
    setAllowedCatList(scheme.eligibilityCriteria?.allowedCategories || []);
    setDocInputs(scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? scheme.requiredDocuments : ['']);
    setUploadedPath(scheme.formUrl || '');
    // Prefill expiry date picker (convert ISO → YYYY-MM-DD)
    setExpiresAt(scheme.expiresAt ? new Date(scheme.expiresAt).toISOString().split('T')[0] : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this scheme? This will remove all views/download records.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/schemes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setFormSuccess('Welfare scheme deleted.');
        fetchSchemes();
      }
    } catch (err) {
      setFormError('Error deleting scheme.');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('Agriculture');
    setMinAge('0');
    setMaxAge('120');
    setMaxIncome('');
    setAllowedOccString('');
    setAllowedCatList([]);
    setDocInputs(['']);
    setSelectedFile(null);
    setUploadedPath('');
    setExpiresAt('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Welfare Schemes</h1>
            <p className="text-slate-400 text-sm">Add new welfare schemes, configure precise eligibility screening criteria, and upload application documents.</p>
          </div>
        </div>
        {isEditing && (
          <button
            onClick={resetForm}
            className="bg-rose-950/40 text-rose-300 border border-rose-900/50 hover:bg-rose-900/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel Edit Mode
          </button>
        )}
      </div>

      {/* Success/Error Feedback */}
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

      {/* Scheme Form Panel */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800">
        <h3 className="text-white font-extrabold text-lg mb-6 flex items-center space-x-2">
          <span>{isEditing ? 'Edit Welfare Scheme' : 'Register New Welfare Scheme'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left: General Specs */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Scheme Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Poultry Farming Assistance Subsidy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Detailed Description *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write a clear summary explaining setup assistance, support brackets, veterinary visits, or feed subsidies..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">Panchayat Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">Application Form Upload</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="form-upload-input"
                    />
                    <label
                      htmlFor="form-upload-input"
                      className="w-full text-center block bg-slate-900 hover:bg-slate-850 text-slate-350 border border-slate-800 hover:border-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all truncate"
                    >
                      {uploading ? 'Uploading Document...' : uploadedPath ? `Uploaded: ${uploadedPath.split('/').pop()}` : 'Choose PDF/DOC File'}
                    </label>
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2 flex items-center gap-1">
                    <Calendar size={13} className="text-amber-400" />
                    Application Deadline (Expiry Date)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none transition-all"
                  />
                  <p className="text-slate-600 text-[10px] mt-1">
                    Leave blank = Always Open. Citizens will see a countdown badge on the scheme card.
                  </p>
                  {expiresAt && (
                    <div className="mt-2">
                      <span className="text-slate-500 text-[10px] mr-2">Preview:</span>
                      <CountdownBadge expiresAt={expiresAt} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Eligibility Details */}
            <div className="space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-850">
              <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">Screening Criteria</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Min Age</label>
                  <input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Max Age</label>
                  <input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Max Annual Income (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000 (blank = no limit)"
                  value={maxIncome}
                  onChange={(e) => setMaxIncome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Eligible Occupations</label>
                <input
                  type="text"
                  placeholder="Farmer, Student (comma separated)"
                  value={allowedOccString}
                  onChange={(e) => setAllowedOccString(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 placeholder-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Eligible Categories</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {socialCategories.map((cat) => (
                    <label key={cat} className="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowedCatList.includes(cat)}
                        onChange={() => handleCategoryCheckbox(cat)}
                        className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Document attachment row */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-2">Required Document Enclosures</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {docInputs.map((doc, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    placeholder={`Document Name (e.g. Income Certificate)`}
                    value={doc}
                    onChange={(e) => handleDocChange(idx, e.target.value)}
                    className="flex-grow bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                  />
                  <div className="flex shrink-0">
                    <button
                      type="button"
                      onClick={() => removeDocField(idx)}
                      disabled={docInputs.length === 1}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <MinusCircle className="h-5 w-5" />
                    </button>
                    {idx === docInputs.length - 1 && (
                      <button
                        type="button"
                        onClick={addDocField}
                        className="text-emerald-500 hover:text-emerald-400 p-1"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 glow-btn text-sm"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? 'Save Scheme Changes' : 'Register New Scheme'}</span>
          </button>
        </form>
      </div>

      {/* Directory of current schemes for management */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg">Current Welfare Schemes ({schemes.length})</h3>
        {loading ? (
          <p className="text-slate-500 text-center py-6">Loading list...</p>
        ) : schemes.length === 0 ? (
          <p className="text-slate-505 text-center py-6">No schemes registered in system.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {schemes.map((s) => (
              <div key={s._id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="bg-slate-900 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-850">
                      {s.category}
                    </span>
                    <CountdownBadge expiresAt={s.expiresAt} />
                    {s.formUrl && (
                      <span className="flex items-center space-x-0.5 text-emerald-400 text-[9px] font-bold uppercase">
                        <FileText className="h-3 w-3" />
                        <span>Form Attached</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-bold text-base mt-1">{s.title}</h4>
                  <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{s.description}</p>
                  {s.expiresAt && (
                    <p className="text-amber-500/70 text-[10px] mt-1 font-semibold">
                      ⏰ Deadline: {new Date(s.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleEditClick(s)}
                    className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 p-2 rounded-lg"
                    title="Edit Scheme Settings"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(s._id)}
                    className="bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 p-2 rounded-lg"
                    title="Delete Scheme"
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

export default ManageSchemes;
