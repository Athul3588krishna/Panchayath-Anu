import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
      color: '#94a3b8',
      paddingTop: '3rem',
      paddingBottom: '1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                borderRadius: '10px', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
              }}>
                <Landmark size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Smart Panchayat</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Welfare Portal</div>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.7, margin: 0, color: '#64748b' }}>
              A centralized digital platform to access Panchayat welfare schemes, eligibility checks, and official notices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/schemes', label: 'Welfare Schemes' },
                { to: '/announcements', label: 'Notices & Circulars' },
                { to: '/register', label: 'Register as Citizen' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: MapPin, text: 'Panchayat Office, Kerala - 685001' },
                { icon: Phone, text: '+91 484 000 0000' },
                { icon: Mail, text: 'secretary@panchayat.gov.in' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <Icon size={14} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Government Links */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Government Portals
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { href: 'https://kerala.gov.in', label: 'Kerala Government' },
                { href: 'https://lsgkerala.gov.in', label: 'LSG Kerala' },
                { href: 'https://pmayg.nic.in', label: 'PMAY Gramin' },
              ].map(({ href, label }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  {label} <ExternalLink size={11} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
            © {new Date().getFullYear()} Smart Panchayat Welfare Portal. All rights reserved.
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#334155' }}>
            A Digital Initiative under Kerala Panchayat Act 1994
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
