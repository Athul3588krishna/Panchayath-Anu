import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Clock, FileText, CheckCircle, AlertCircle, ChevronLeft, Loader } from 'lucide-react';

const TIME_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

const getAvailableDates = (count = 21) => {
  const dates = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1); 
  while (dates.length < count) {
    if (cursor.getDay() !== 0) { 
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const toLocalYYYYMMDD = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AppointmentBooking = () => {
  const { token, user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const availableDates = getAvailableDates(21);

  const purposes = [
    'Document Verification for Scheme Application',
    'Eligibility Inquiry',
    'Grievance / Complaint',
    'Certificate Collection',
    'General Query',
    'Other'
  ];

  
  useEffect(() => {
    if (!selectedDate) return;
    const fetchBooked = async () => {
      setLoadingSlots(true);
      try {
        const dateStr = toLocalYYYYMMDD(selectedDate);
        const res = await fetch(`${API_BASE_URL}/appointments/booked-slots?date=${dateStr}`);
        const data = await res.json();
        setBookedSlots(Array.isArray(data) ? data : []);
      } catch (e) {
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchBooked();
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!token) { navigate('/login'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          date: toLocalYYYYMMDD(selectedDate),
          timeSlot: selectedSlot,
          purpose
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Booking failed. Please try again.');
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => d?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dayLabel = (d) => d.toLocaleDateString('en-IN', { weekday: 'short' });
  const monthLabel = (d) => d.toLocaleDateString('en-IN', { month: 'short' });

  if (success) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '3rem', textAlign: 'center', maxWidth: 480, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={36} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            {language === 'ml' ? 'അപ്പോയിൻ്റ്‌മെൻ്റ് ബുക്ക് ചെയ്തു!' : 'Appointment Booked!'}
          </h2>
          <p style={{ color: '#475569', marginBottom: '0.5rem' }}>
            {language === 'ml' ? 'തിയതി:' : 'Date:'} <strong>{formatDate(selectedDate)}</strong>
          </p>
          <p style={{ color: '#475569', marginBottom: '0.5rem' }}>
            {language === 'ml' ? 'സമയം:' : 'Time:'} <strong>{selectedSlot}</strong>
          </p>
          <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
            {language === 'ml' ? 'ആവശ്യം:' : 'Purpose:'} <strong>{purpose}</strong>
          </p>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.85rem', marginBottom: '2rem' }}>
            <p style={{ color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
              {language === 'ml'
                ? 'പഞ്ചായത്ത് ഓഫീസ്, ക്ഷേമ വകുപ്പ്, 10AM–4PM'
                : 'Visit: Panchayat Office, Welfare Desk · Please bring your Aadhaar Card'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/profile" style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>
              {language === 'ml' ? 'പ്രൊഫൈൽ കാണുക' : 'View My Profile'}
            </Link>
            <Link to="/" style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>
              {language === 'ml' ? 'ഹോം' : 'Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
          <ChevronLeft size={16} /> {language === 'ml' ? 'തിരിച്ചു പോകൂ' : 'Back'}
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
          {language === 'ml' ? 'ഓഫീസ് അപ്പോയിൻ്റ്‌മെൻ്റ് ബുക്ക് ചെയ്യൂ' : 'Book Panchayat Office Appointment'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
          {language === 'ml'
            ? 'രേഖ പരിശോധന, ആനുകൂല്യ അപേക്ഷ, അല്ലെങ്കിൽ ഏതെങ്കിലും ആവശ്യത്തിനായി ഒരു സ്ലോട്ട് ബുക്ക് ചെയ്യൂ.'
            : 'Reserve a slot for document verification, scheme applications, or general queries.'}
        </p>
      </div>

      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '0' }}>
        {['Select Date', 'Choose Time', 'Purpose', 'Confirm'].map((label, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step > i + 1 ? '#16a34a' : step === i + 1 ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 800,
                color: step >= i + 1 ? '#fff' : '#94a3b8',
                transition: 'all 0.3s ease'
              }}>
                {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: step === i + 1 ? '#1d4ed8' : '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < 3 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#16a34a' : '#e2e8f0', marginBottom: '1.2rem', transition: 'background 0.3s ease' }} />}
          </React.Fragment>
        ))}
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#2563eb" />
              {language === 'ml' ? 'തിയതി തിരഞ്ഞെടുക്കൂ' : 'Select a Date'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {language === 'ml' ? 'ഞായർ ഒഴികെ ഏതു ദിവസവും ലഭ്യം.' : 'Available Monday–Saturday. Sundays excluded.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.6rem' }}>
              {availableDates.map((d, i) => {
                const isSelected = selectedDate?.toDateString() === d.toDateString();
                return (
                  <button key={i} onClick={() => { setSelectedDate(d); setSelectedSlot(''); }}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : '#f8fafc',
                      border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                      borderRadius: '12px', padding: '0.75rem 0.4rem',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease'
                    }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isSelected ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginBottom: '0.2rem', textTransform: 'uppercase' }}>{dayLabel(d)}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isSelected ? '#fff' : '#0f172a', lineHeight: 1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: isSelected ? 'rgba(255,255,255,0.75)' : '#64748b', marginTop: '0.2rem' }}>{monthLabel(d)}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(2)} disabled={!selectedDate}
                style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: selectedDate ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : '#e2e8f0', color: selectedDate ? '#fff' : '#94a3b8', fontWeight: 700, border: 'none', cursor: selectedDate ? 'pointer' : 'not-allowed', fontSize: '0.9rem' }}>
                {language === 'ml' ? 'അടുത്തത്' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="#2563eb" />
              {language === 'ml' ? 'സമയ സ്ലോട്ട് തിരഞ്ഞെടുക്കൂ' : 'Choose Time Slot'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{formatDate(selectedDate)}</p>
            {loadingSlots ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button key={slot} disabled={isBooked} onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '1rem', borderRadius: '12px', border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                        background: isBooked ? '#f1f5f9' : isSelected ? '#eff6ff' : '#fff',
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        textAlign: 'center', transition: 'all 0.2s ease',
                        opacity: isBooked ? 0.5 : 1
                      }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: isBooked ? '#94a3b8' : isSelected ? '#1d4ed8' : '#0f172a' }}>{slot}</div>
                      <div style={{ fontSize: '0.7rem', color: isBooked ? '#94a3b8' : '#64748b', marginTop: '0.2rem' }}>{isBooked ? 'Booked' : 'Available'}</div>
                    </button>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setStep(3)} disabled={!selectedSlot}
                style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: selectedSlot ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : '#e2e8f0', color: selectedSlot ? '#fff' : '#94a3b8', fontWeight: 700, border: 'none', cursor: selectedSlot ? 'pointer' : 'not-allowed' }}>
                {language === 'ml' ? 'അടുത്തത്' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#2563eb" />
              {language === 'ml' ? 'സന്ദർശന ആവശ്യം' : 'Purpose of Visit'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {language === 'ml' ? 'ഏറ്റവും ഉചിതമായത് തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക.' : 'Select the closest match or type your own reason.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {purposes.map((p) => (
                <button key={p} onClick={() => setPurpose(p)}
                  style={{
                    padding: '0.85rem 1.25rem', borderRadius: '12px', textAlign: 'left',
                    border: purpose === p ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: purpose === p ? '#eff6ff' : '#fff',
                    cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                    color: purpose === p ? '#1d4ed8' : '#334155', transition: 'all 0.2s ease'
                  }}>
                  {p}
                </button>
              ))}
            </div>
            <textarea
              placeholder={language === 'ml' ? 'അല്ലെങ്കിൽ ഇവിടെ നേരിട്ട് ടൈപ്പ് ചെയ്യൂ...' : 'Or type your own purpose here...'}
              value={purposes.includes(purpose) ? '' : purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', fontSize: '0.875rem', color: '#334155', outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setStep(4)} disabled={!purpose.trim()}
                style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: purpose.trim() ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : '#e2e8f0', color: purpose.trim() ? '#fff' : '#94a3b8', fontWeight: 700, border: 'none', cursor: purpose.trim() ? 'pointer' : 'not-allowed' }}>
                {language === 'ml' ? 'അടുത്തത്' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
              {language === 'ml' ? 'വിശദാംശങ്ങൾ സ്ഥിരീകരിക്കൂ' : 'Confirm Your Appointment'}
            </h2>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Citizen', value: user?.name },
                { label: 'Date', value: formatDate(selectedDate) },
                { label: 'Time Slot', value: selectedSlot },
                { label: 'Purpose', value: purpose },
                { label: 'Location', value: 'Panchayat Office, Welfare Desk' }
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', width: 90, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{value}</span>
                </div>
              ))}
            </div>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <button onClick={() => setStep(3)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', fontWeight: 700, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {submitting ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Booking...</> : (language === 'ml' ? 'ബുക്ക് ചെയ്യൂ' : 'Confirm Booking')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;
