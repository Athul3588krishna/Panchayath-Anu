import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Calendar, Megaphone, ShieldAlert, RefreshCw } from 'lucide-react';

const Announcements = () => {
  const { t } = useLanguage();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/announcements`);
        if (res.ok) {
          const data = await res.json();
          setNotices(data);
        }
      } catch (err) {
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
          <Megaphone className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{t('announcementsTitle')}</h1>
          <p className="text-slate-400 text-sm">{t('announcementsSubText')}</p>
        </div>
      </div>

      {/* Main Notice Stack */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-450 mb-2" />
          <span>Loading Notice Board...</span>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border border-slate-900 rounded-3xl">
          <Bell className="h-10 w-10 mx-auto mb-2 text-slate-650" />
          <p className="text-sm">There are no notices published currently.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className={`glass-card p-6 rounded-3xl border transition-all ${
                notice.isImportant
                  ? 'border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.05)] bg-gradient-to-r from-emerald-950/10 to-slate-900/40'
                  : 'border-slate-800/80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(notice.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {notice.isImportant && (
                  <span className="w-fit flex items-center space-x-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <ShieldAlert className="h-3 w-3" />
                    <span>{t('highPriority')}</span>
                  </span>
                )}
              </div>

              <h3 className="text-white font-extrabold text-lg md:text-xl mb-3 leading-snug">
                {notice.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;

