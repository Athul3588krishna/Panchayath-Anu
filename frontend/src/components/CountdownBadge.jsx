import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

/**
 * CountdownBadge — displays expiry status of a scheme
 * Props:
 *   expiresAt: Date string | null  (null = always open)
 */
const CountdownBadge = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!expiresAt) { setTimeLeft(null); return; }

    const compute = () => {
      const now = new Date();
      const exp = new Date(expiresAt);
      const diffMs = exp - now;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft({ diffMs, diffDays, diffHours, exp });
    };

    compute();
    const id = setInterval(compute, 60000); // refresh every minute
    return () => clearInterval(id);
  }, [expiresAt]);

  // No expiry
  if (!expiresAt || timeLeft === null) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: '#dcfce7', color: '#15803d',
        border: '1px solid #bbf7d0',
        borderRadius: '999px', padding: '0.22rem 0.65rem',
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}>
        <CheckCircle size={11} />
        Always Open
      </span>
    );
  }

  // Expired
  if (timeLeft.diffMs <= 0) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: '#fee2e2', color: '#b91c1c',
        border: '1px solid #fecaca',
        borderRadius: '999px', padding: '0.22rem 0.65rem',
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}>
        <AlertCircle size={11} />
        CLOSED
      </span>
    );
  }

  // Expiring very soon (≤ 3 days) — urgent red pulse
  if (timeLeft.diffDays <= 3) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: '#fff7ed', color: '#c2410c',
        border: '1px solid #fed7aa',
        borderRadius: '999px', padding: '0.22rem 0.65rem',
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase',
        animation: 'pulse 2s infinite'
      }}>
        <Clock size={11} />
        {timeLeft.diffDays === 0
          ? `${timeLeft.diffHours}h left!`
          : `${timeLeft.diffDays}d left!`}
      </span>
    );
  }

  // Expiring within 7 days — amber warning
  if (timeLeft.diffDays <= 7) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: '#fef9c3', color: '#a16207',
        border: '1px solid #fde68a',
        borderRadius: '999px', padding: '0.22rem 0.65rem',
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}>
        <Clock size={11} />
        {timeLeft.diffDays} days left
      </span>
    );
  }

  // Normal — blue open badge with date
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: '#dbeafe', color: '#1d4ed8',
      border: '1px solid #bfdbfe',
      borderRadius: '999px', padding: '0.22rem 0.65rem',
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }}>
      <Calendar size={11} />
      Open · {timeLeft.diffDays}d remaining
    </span>
  );
};

export default CountdownBadge;
