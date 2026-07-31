import React, { useState, useMemo } from 'react';
import { 
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
  FileText
} from 'lucide-react';
import { MEET_PLATFORMS } from '../utils/storage';

export default function GeneralMeetsWorkspace({
  generalMeets = [],
  onAddMeet,
  onEditMeet,
  onDeleteMeet,
  onLoadSamples
}) {
  const [platformFilter, setPlatformFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Computations
  const stats = useMemo(() => {
    const total = generalMeets.length;
    const now = new Date();

    const zoomCount = generalMeets.filter(m => m.platform === 'Zoom').length;
    const lumaCount = generalMeets.filter(m => m.platform === 'Luma (lu.ma)').length;
    const upcomingCount = generalMeets.filter(m => new Date(m.startDate) >= now).length;

    return { total, zoomCount, lumaCount, upcomingCount };
  }, [generalMeets]);

  // Filtered Meets list
  const filteredMeets = useMemo(() => {
    return generalMeets.filter(m => {
      if (platformFilter !== 'All' && m.platform !== platformFilter) return false;

      const matchesSearch = 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.platform && m.platform.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [generalMeets, platformFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 211, 238, 0.2)', color: 'var(--accent-cyan)' }}>
            <Globe size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-lbl">Total General Meets & Webinars</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)' }}>
            <CalendarIcon size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.lumaCount}</div>
            <div className="stat-lbl">Luma (lu.ma) Events</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-purple)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.zoomCount}</div>
            <div className="stat-lbl">Zoom Meetings</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.upcomingCount}</div>
            <div className="stat-lbl">Upcoming Meets</div>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={22} color="var(--accent-cyan)" /> General Meets & Webinars Workspace
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Track meets from Zoom, Luma.com, MS Teams, Unstop, and others — even if the join link is released on the date of event.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="header-search" style={{ width: '220px' }}>
              <Search className="search-icon" size={16} />
              <input 
                type="text"
                placeholder="Search general meets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {generalMeets.length === 0 && onLoadSamples && (
              <button className="btn btn-secondary" onClick={onLoadSamples}>
                <Sparkles size={16} color="var(--accent-cyan)" /> Load Demo Meets
              </button>
            )}

            {/* Add Meet Button */}
            <button className="btn btn-primary" onClick={onAddMeet}>
              <Plus size={16} /> Schedule General Meet
            </button>
          </div>
        </div>

        {/* Filter Sub-Tabs */}
        <div className="view-options" style={{ width: 'fit-content' }}>
          <button 
            className={`view-btn ${platformFilter === 'All' ? 'active' : ''}`}
            onClick={() => setPlatformFilter('All')}
          >
            All Platforms ({stats.total})
          </button>

          {MEET_PLATFORMS.map(p => (
            <button 
              key={p}
              className={`view-btn ${platformFilter === p ? 'active' : ''}`}
              onClick={() => setPlatformFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* MEETS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredMeets.length === 0 ? (
          <div className="glass-panel empty-state">
            <AlertCircle size={40} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Meets Found</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {generalMeets.length === 0 ? 'No general meets recorded. Click below to add your Zoom, Luma, or webinar schedule!' : 'No meets match your platform filter.'}
            </p>
            <button className="btn btn-primary" onClick={onAddMeet}>
              + Schedule General Meet
            </button>
          </div>
        ) : (
          filteredMeets.map((m) => {
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
                  borderLeft: '4px solid var(--accent-cyan)'
                }}
              >
                {/* Main Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      {m.title}
                    </span>

                    {/* Platform Tag */}
                    <span 
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '12px',
                        background: 'rgba(34, 211, 238, 0.15)',
                        color: 'var(--accent-cyan)',
                        border: '1px solid var(--accent-cyan)'
                      }}
                    >
                      {m.platform || 'General'}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <CalendarIcon size={14} color="var(--accent-cyan)" />
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

                {/* Right: Link / Status & Actions */}
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
                      <Link2Off size={14} /> Link Pending (Released on date)
                    </span>
                  ) : m.link ? (
                    <a 
                      href={m.link.startsWith('http') ? m.link : `https://${m.link}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ fontSize: '0.825rem', padding: '0.55rem 1rem' }}
                    >
                      Join Event Link <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No link attached</span>
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
