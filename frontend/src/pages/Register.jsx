import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Landmark, Mail, Lock, User, LandmarkIcon, HelpCircle, ArrowRight, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  
  const [age, setAge] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [occupation, setOccupation] = useState('');
  const [category, setCategory] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setFormError('Name, email, and password are required fields.');
    }

    setLoading(true);
    setFormError('');

    try {
      await register({
        name,
        email,
        password,
        role: 'citizen', 
        age: age ? Number(age) : null,
        annualIncome: annualIncome ? Number(annualIncome) : null,
        occupation: occupation || '',
        category: category || ''
      });
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Registration failed. Try a different email.');
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

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="glass-card w-full max-w-2xl p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400 mb-3">
            <Landmark className="h-6 w-6" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide text-center">Citizen Registration</h2>
          <p className="text-slate-400 text-xs text-center mt-1">Configure your eligibility profile to unlock personalized scheme recommendation.</p>
        </div>

        {formError && (
          <div className="bg-rose-950/40 border border-rose-950 text-rose-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">1. Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 text-xs font-semibold mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-655 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          
          <div>
            <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">2. Eligibility Screening Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Annual Household Income (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Occupation</label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none transition-all"
                >
                  <option value="">Select Occupation</option>
                  {occupationsList.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Social Category (Caste)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none transition-all"
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
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-colors glow-btn text-sm mt-4"
          >
            <span>{loading ? 'Creating Account...' : 'Register as Citizen'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="text-slate-400 text-xs text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
