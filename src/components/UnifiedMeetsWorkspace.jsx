import React, { useState, useMemo } from 'react';
import { 
  Video, 
  Globe,
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles,
  AlertCircle,
  Link2Off,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { MEET_PLATFORMS } from '../utils/storage';

export default function UnifiedMeetsWorkspace({
  meets = [],
  generalMeets = [],
  onAddGoogleMeet,
  onEditGoogleMeet,
  onDeleteGoogleMeet,
  onAddGeneralMeet,
  onEditGeneralMeet,
  onDeleteGeneralMeet,
  onLoadSamples
}) {
  const [platformFilter, setPlatformFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Combine both sources
  const allMeetings = useMemo(() => {
    const combined = [
      ...meets.map(m => ({ ...m, meetType: 'google', platform: 'Google Meet' })),
      ...generalMeets.map(m => ({ ...m, meetType: 'general', platform: m.platform || 'General' }))
    ];

    return combined.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [meets, generalMeets]);

  // Compute stats
  const stats = useMemo(() => {
    const total = allMeetings.length;
    const now = new Date();

    const googleCount = meets.length;
    const generalCount = generalMeets.length;
    const upcomingCount = allMeetings.filter(m => new Date(m.startDate) >= now).length;
    const todayCount = allMeetings.filter(m => {
      const d = new Date(m.startDate);
      return d.toDateString() === now.toDateString();
    }).length;

    return { total, googleCount, generalCount, upcomingCount, todayCount };
  }, [meets, generalMeets, allMeetings]);

  // Absolute next upcoming meeting
  const nextMeeting = useMemo(() => {
    const now = new Date();
    const sortedUpcoming = allMeetings
      .filter(m => new Date(m.startDate) >= now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    return sortedUpcoming[0] || null;
  }, [allMeetings]);

  // Filtered list
  const filteredMeetings = useMemo(() => {
    return allMeetings.filter(m => {
      if (platformFilter !== 'All') {
        if (platformFilter === 'Google Meet' && m.meetType !== 'google') return false;
        if (platformFilter !== 'Google Meet' && m.platform !== platformFilter) return false;
      }

      const matchesSearch = 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.platform.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [allMeetings, platformFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* NEXT UPCOMING MEETING BANNER */}
      {nextMeeting && (
        <div 
          className="glass-panel"
          style={{
            padding: '1.5rem 2rem',
            background: nextMeeting.meetType === 'google' 
              ? 'linear-gradient(135deg, rgba(0, 172, 71, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
            borderLeft: nextMeeting.meetType === 'google' ? '4px solid #00ac47' : '4px solid var(--accent-cyan)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
            boxShadow: '0 0 25px rgba(0, 172, 71, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                background: nextMeeting.meetType === 'google' ? '#00ac47' : 'var(--accent-cyan)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: nextMeeting.meetType === 'google' ? '0 0 15px rgba(0, 172, 71, 0.6)' : '0 0 15px rgba(34, 211, 238, 0.6)'
              }}
            >
              {nextMeeting.meetType === 'google' ? <Video size={28} /> : <Globe size={28} />}
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                ⚡ NEXT MEETING ({nextMeeting.platform.toUpperCase()})
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', margin: 0 }}>
                {nextMeeting.title}
              </h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Clock size={15} color="var(--text-muted)" />
                <span>{new Date(nextMeeting.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {nextMeeting.link && (
              <a 
                href={nextMeeting.link.startsWith('http') ? nextMeeting.link : `https://${nextMeeting.link}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
                style={{ 
                  fontSize: '0.95rem', 
                  padding: '0.75rem 1.5rem'
                }}
              >
                Join Now <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      )}


      {/* CONTROLS TOOLBAR */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
            <div className="search-box" style={{ maxWidth: '300px', flex: 1 }}>
              <input 
                type="text" 
                placeholder="Search events/meets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {allMeetings.length === 0 && onLoadSamples && (
              <button className="btn btn-secondary" onClick={onLoadSamples}>
                <Sparkles size={16} color="var(--accent-cyan)" /> Load Demo Meets
              </button>
            )}

            {/* Quick Add Buttons */}
            <button className="btn btn-primary" onClick={onAddGoogleMeet}>
              <Plus size={16} /> Schedule Google Meet
            </button>
            <button className="btn btn-primary" onClick={onAddGeneralMeet}>
              <Plus size={16} /> Schedule Other Event
            </button>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="view-options" style={{ width: 'fit-content' }}>
          <button 
            className={`view-btn ${platformFilter === 'All' ? 'active' : ''}`}
            onClick={() => setPlatformFilter('All')}
          >
            All Platforms ({stats.total})
          </button>
          <button 
            className={`view-btn ${platformFilter === 'Google Meet' ? 'active' : ''}`}
            onClick={() => setPlatformFilter('Google Meet')}
          >
            Google Meet ({stats.googleCount})
          </button>

          {MEET_PLATFORMS.map(p => {
            const count = generalMeets.filter(m => m.platform === p).length;
            return (
              <button 
                key={p}
                className={`view-btn ${platformFilter === p ? 'active' : ''}`}
                onClick={() => setPlatformFilter(p)}
              >
                {p} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* MEETINGS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredMeetings.length === 0 ? (
          <div className="glass-panel empty-state">
            <AlertCircle size={40} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Meetings Found</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {allMeetings.length === 0 ? 'Your combined meetings inbox is empty. Schedule a call above!' : 'No entries match your filters.'}
            </p>
          </div>
        ) : (
          filteredMeetings.map((m) => {
            const isGoogle = m.meetType === 'google';
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
                  borderLeft: isGoogle ? '4px solid #00ac47' : '4px solid var(--accent-cyan)',
                  boxShadow: isGoogle && m.isImportant !== false ? '0 0 12px rgba(0, 172, 71, 0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isGoogle ? <Video size={18} color="#00ac47" /> : <Globe size={18} color="var(--accent-cyan)" />}
                      {m.title}
                    </span>

                    {/* Platform Tag */}
                    <span 
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '12px',
                        background: isGoogle ? 'rgba(0, 172, 71, 0.15)' : 'rgba(34, 211, 238, 0.15)',
                        color: isGoogle ? '#00ac47' : 'var(--accent-cyan)',
                        border: isGoogle ? '1px solid #00ac47' : '1px solid var(--accent-cyan)'
                      }}
                    >
                      {m.platform}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <CalendarIcon size={14} color="var(--text-dim)" />
                    <span>{new Date(m.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
                  </div>

                  {/* Notes */}
                  {m.notes && (
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={13} color="var(--primary)" />
                      <span>{m.notes}</span>
                    </div>
                  )}
                </div>

                {/* Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {m.isLinkPending ? (
                    <span 
                      style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: 700, 
                        color: 'var(--accent-amber)', 
                        background: 'rgba(245, 158, 11, 0.15)',
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--accent-amber)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Link2Off size={14} /> Link Pending
                    </span>
                  ) : m.link ? (
                    <a 
                      href={m.link.startsWith('http') ? m.link : `https://${m.link}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ 
                        background: isGoogle ? 'linear-gradient(135deg, #00ac47 0%, #008332 100%)' : 'linear-gradient(135deg, var(--primary), var(--accent-cyan))', 
                        fontSize: '0.825rem', 
                        padding: '0.55rem 1rem' 
                      }}
                    >
                      Join <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No link</span>
                  )}

                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => isGoogle ? onEditGoogleMeet(m) : onEditGeneralMeet(m)}
                    title="Edit"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => isGoogle ? onDeleteGoogleMeet(m.id) : onDeleteGeneralMeet(m.id)}
                    title="Delete"
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
