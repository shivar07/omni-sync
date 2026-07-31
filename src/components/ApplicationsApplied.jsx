import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';
import { APPLICATION_CATEGORIES, APPLICATION_STATUSES } from '../utils/storage';

const STATUS_CONFIG = {
  Submitted: { label: '📤 Submitted', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  'Under Review': { label: '📑 Under Review', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  Interviewing: { label: '🎯 Interviewing', color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  Accepted: { label: '🎉 Accepted / Offer', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  Rejected: { label: '❌ Archived / Rejected', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' }
};

export default function ApplicationsApplied({
  applications = [],
  onAddApplication,
  onEditApplication,
  onDeleteApplication,
  onUpdateStatus,
  onLoadSamples
}) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Computations
  const stats = useMemo(() => {
    const total = applications.length;
    const underReviewCount = applications.filter(a => a.status === 'Under Review').length;
    const interviewingCount = applications.filter(a => a.status === 'Interviewing').length;
    const acceptedCount = applications.filter(a => a.status === 'Accepted').length;

    return { total, underReviewCount, interviewingCount, acceptedCount };
  }, [applications]);

  // Filtered list
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      if (filterStatus !== 'All' && app.status !== filterStatus) return false;
      if (categoryFilter !== 'All' && app.category !== categoryFilter) return false;

      const matchesSearch = 
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.notes && app.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.category && app.category.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    }).sort((a, b) => new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0));
  }, [applications, filterStatus, categoryFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-lbl">Total Applications Applied</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.underReviewCount}</div>
            <div className="stat-lbl">Under Review</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 211, 238, 0.2)', color: 'var(--accent-cyan)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.interviewingCount}</div>
            <div className="stat-lbl">Interviewing</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.acceptedCount}</div>
            <div className="stat-lbl">Accepted / Offers</div>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={22} color="var(--primary)" /> Applications Applied Progress Tracker
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Track all your submitted internship and job application links in one place. Click to check progress anytime.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="header-search" style={{ width: '220px' }}>
              <Search className="search-icon" size={16} />
              <input 
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Dropdown */}
            <select 
              className="form-select"
              style={{ width: '170px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              {APPLICATION_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {applications.length === 0 && onLoadSamples && (
              <button className="btn btn-secondary" onClick={onLoadSamples}>
                <Sparkles size={16} color="var(--accent-cyan)" /> Load Demo Applications
              </button>
            )}

            {/* Add Application Button */}
            <button className="btn btn-primary" onClick={onAddApplication}>
              <Plus size={16} /> Record Applied Link
            </button>
          </div>
        </div>

        {/* Filter Sub-Tabs */}
        <div className="view-options" style={{ width: 'fit-content' }}>
          <button 
            className={`view-btn ${filterStatus === 'All' ? 'active' : ''}`}
            onClick={() => setFilterStatus('All')}
          >
            All Applied ({stats.total})
          </button>
          <button 
            className={`view-btn ${filterStatus === 'Submitted' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Submitted')}
          >
            Submitted
          </button>
          <button 
            className={`view-btn ${filterStatus === 'Under Review' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Under Review')}
          >
            Under Review ({stats.underReviewCount})
          </button>
          <button 
            className={`view-btn ${filterStatus === 'Interviewing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Interviewing')}
          >
            Interviewing ({stats.interviewingCount})
          </button>
          <button 
            className={`view-btn ${filterStatus === 'Accepted' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Accepted')}
          >
            Accepted ({stats.acceptedCount})
          </button>
        </div>
      </div>

      {/* APPLICATIONS CARDS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredApps.length === 0 ? (
          <div className="glass-panel empty-state">
            <AlertCircle size={40} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Applications Found</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {applications.length === 0 ? 'You haven\'t added any applied application links yet. Click below to record your internship or job submission!' : 'No applications match your filter.'}
            </p>
            <button className="btn btn-primary" onClick={onAddApplication}>
              + Record Applied Link
            </button>
          </div>
        ) : (
          filteredApps.map((app) => {
            const stInfo = STATUS_CONFIG[app.status || 'Submitted'] || STATUS_CONFIG.Submitted;

            return (
              <div 
                key={app.id} 
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  borderLeft: `4px solid ${stInfo.color}`
                }}
              >
                {/* Main Application Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      {app.title}
                    </span>

                    {/* Status Badge */}
                    <span 
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '12px',
                        backgroundColor: stInfo.bg,
                        color: stInfo.color
                      }}
                    >
                      {stInfo.label}
                    </span>

                    {/* Category Tag */}
                    <span 
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {app.category || 'Internship'}
                    </span>
                  </div>

                  {/* Applied Date & Info */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2px' }}>
                    <span>Applied: <strong style={{ color: 'var(--text-main)' }}>{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recently'}</strong></span>
                  </div>

                  {/* Notes / Confirmation Info */}
                  {app.notes && (
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={13} color="var(--primary)" />
                      <span>{app.notes}</span>
                    </div>
                  )}
                </div>

                {/* Right: Direct Portal Link & Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {app.link ? (
                    <a 
                      href={app.link.startsWith('http') ? app.link : `https://${app.link}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ fontSize: '0.825rem', padding: '0.55rem 1rem' }}
                    >
                      Check Status Portal <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No portal link</span>
                  )}

                  {/* Status Dropdown Quick Selector */}
                  <select 
                    className="form-select"
                    style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                    value={app.status || 'Submitted'}
                    onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                  >
                    {APPLICATION_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => onEditApplication(app)}
                    title="Edit Application"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => onDeleteApplication(app.id)}
                    title="Delete Application"
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
