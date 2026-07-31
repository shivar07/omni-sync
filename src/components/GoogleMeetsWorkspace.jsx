import React, { useState, useMemo } from 'react';
import { 
  Video, 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles,
  AlertCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function GoogleMeetsWorkspace({
  meets = [],
  onAddMeet,
  onEditMeet,
  onDeleteMeet,
  onLoadSamples
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Computations
  const stats = useMemo(() => {
    const total = meets.length;
    const now = new Date();

    const upcoming = meets.filter(m => new Date(m.startDate) >= now);
    const today = meets.filter(m => {
      const d = new Date(m.startDate);
      return d.toDateString() === now.toDateString();
    });

    return { total, upcomingCount: upcoming.length, todayCount: today.length };
  }, [meets]);

  // Next upcoming meet for Top Hero Banner
  const nextMeet = useMemo(() => {
    const now = new Date();
    const sortedUpcoming = [...meets]
      .filter(m => new Date(m.startDate) >= now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    return sortedUpcoming[0] || null;
  }, [meets]);

  // Filtered Meets list
  const filteredMeets = useMemo(() => {
    return meets.filter(m => {
      const matchesSearch = 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.link && m.link.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [meets, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* TOP HERO BANNER FOR NEXT UPCOMING MEET */}
      {nextMeet && (
        <div 
          className="glass-panel"
          style={{
            padding: '1.5rem 2rem',
            background: 'linear-gradient(135deg, rgba(0, 172, 71, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: '2px solid #00ac47',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 0 25px rgba(0, 172, 71, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                background: '#00ac47', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 172, 71, 0.8)',
                animation: 'googleMeetPulse 1.8s infinite alternate'
              }}
            >
              <Video size={28} />
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#00ac47', letterSpacing: '0.05em' }}>
                ⚡ NEXT UPCOMING GOOGLE MEET
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                {nextMeet.title}
              </h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Clock size={15} color="#00ac47" />
                <span>{new Date(nextMeet.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {nextMeet.link && (
              <a 
                href={nextMeet.link.startsWith('http') ? nextMeet.link : `https://${nextMeet.link}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
                style={{ 
                  background: 'linear-gradient(135deg, #00ac47 0%, #008332 100%)', 
                  fontSize: '0.95rem', 
                  padding: '0.75rem 1.5rem',
                  boxShadow: '0 0 15px rgba(0, 172, 71, 0.5)'
                }}
              >
                Join Google Meet Now <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(0, 172, 71, 0.2)', color: '#00ac47' }}>
            <Video size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-lbl">Total Google Meets</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 211, 238, 0.2)', color: 'var(--accent-cyan)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.todayCount}</div>
            <div className="stat-lbl">Meets Scheduled Today</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.upcomingCount}</div>
            <div className="stat-lbl">Upcoming Personal Meets</div>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={22} color="#00ac47" /> Personal Google Meets Workspace
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            High-priority Google Meets automatically reflect on your calendar with an animated glowing pulse effect!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div className="header-search" style={{ width: '220px' }}>
            <Search className="search-icon" size={16} />
            <input 
              type="text"
              placeholder="Search Google Meets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {meets.length === 0 && onLoadSamples && (
            <button className="btn btn-secondary" onClick={onLoadSamples}>
              <Sparkles size={16} color="var(--accent-cyan)" /> Load Demo Meets
            </button>
          )}

          {/* Add Meet Button */}
          <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #00ac47, #008332)' }} onClick={onAddMeet}>
            <Plus size={16} /> Schedule Google Meet
          </button>
        </div>
      </div>

      {/* MEETS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredMeets.length === 0 ? (
          <div className="glass-panel empty-state">
            <AlertCircle size={40} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Google Meets Scheduled</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {meets.length === 0 ? 'Your personal meets list is clear. Click below to schedule your important Google Meet!' : 'No meets match your search.'}
            </p>
            <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #00ac47, #008332)' }} onClick={onAddMeet}>
              + Schedule Google Meet
            </button>
          </div>
        ) : (
          filteredMeets.map((m) => {
            const isUpcoming = new Date(m.startDate) >= new Date();

            return (
              <div 
                key={m.id} 
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  borderLeft: '4px solid #00ac47',
                  boxShadow: m.isImportant !== false ? '0 0 12px rgba(0, 172, 71, 0.2)' : 'none'
                }}
              >
                {/* Main Meet Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={18} color="#00ac47" /> {m.title}
                    </span>

                    {/* Animated Glow Badge */}
                    <span 
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '12px',
                        background: 'rgba(0, 172, 71, 0.15)',
                        color: '#00ac47',
                        border: '1px solid #00ac47'
                      }}
                    >
                      ⚡ Animated Glow on Calendar
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <CalendarIcon size={14} color="#00ac47" />
                    <span><strong style={{ color: 'var(--text-main)' }}>{new Date(m.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</strong></span>
                  </div>

                  {/* Notes */}
                  {m.notes && (
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={13} color="var(--primary)" />
                      <span>{m.notes}</span>
                    </div>
                  )}
                </div>

                {/* Right: Join Button & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {m.link ? (
                    <a 
                      href={m.link.startsWith('http') ? m.link : `https://${m.link}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #00ac47 0%, #008332 100%)', fontSize: '0.825rem', padding: '0.55rem 1rem' }}
                    >
                      Join Google Meet <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No meet link</span>
                  )}

                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => onEditMeet(m)}
                    title="Edit Meet"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => onDeleteMeet(m.id)}
                    title="Delete Meet"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
