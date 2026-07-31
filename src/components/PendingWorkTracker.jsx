import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Search, 
  Calendar, 
  Layers, 
  AlertCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { getDeadlineStatus } from '../utils/storage';

export default function PendingWorkTracker({
  tasks,
  pendingCategories = [],
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onLoadSamples
}) {
  const [filterTab, setFilterTab] = useState('pending'); // 'all', 'pending', 'urgent', 'completed'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Category Color Map
  const categoryColorMap = useMemo(() => {
    const map = {};
    pendingCategories.forEach(c => {
      map[c.name] = c.color || '#f43f5e';
    });
    return map;
  }, [pendingCategories]);

  const getCategoryColor = (catName) => {
    return categoryColorMap[catName] || '#64748b';
  };

  // Computations
  const stats = useMemo(() => {
    const total = tasks.length;
    const pendingCount = tasks.filter(t => t.status !== 'Completed').length;
    const completedCount = tasks.filter(t => t.status === 'Completed').length;

    let overdueCount = 0;
    let dueTodayCount = 0;

    tasks.forEach(t => {
      if (t.status !== 'Completed') {
        const st = getDeadlineStatus(t.deadline, false);
        if (st.type === 'overdue') overdueCount++;
        if (st.type === 'today') dueTodayCount++;
      }
    });

    const highPriorityCount = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

    const urgentCount = tasks.filter(t => {
      if (t.status === 'Completed') return false;
      const st = getDeadlineStatus(t.deadline, false);
      return st.type === 'overdue' || st.type === 'today' || t.priority === 'High';
    }).length;

    return { total, pendingCount, completedCount, overdueCount, dueTodayCount, highPriorityCount, urgentCount };
  }, [tasks]);

  // Urgent list for alert banner (Overdue or Due Today)
  const urgentAlertTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.status === 'Completed') return false;
      const st = getDeadlineStatus(t.deadline, false);
      return st.type === 'overdue' || st.type === 'today';
    });
  }, [tasks]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Tab filter
      if (filterTab === 'pending' && t.status === 'Completed') return false;
      if (filterTab === 'completed' && t.status !== 'Completed') return false;
      if (filterTab === 'urgent') {
        if (t.status === 'Completed') return false;
        const st = getDeadlineStatus(t.deadline, false);
        if (st.type !== 'overdue' && st.type !== 'today' && t.priority !== 'High') return false;
      }

      // Category filter
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;

      // Search term
      const matchesSearch = 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    }).sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (a.status !== 'Completed' && b.status === 'Completed') return -1;
      return new Date(a.deadline || 0) - new Date(b.deadline || 0);
    });
  }, [tasks, filterTab, categoryFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* URGENT DEADLINE ALERT BANNER */}
      {urgentAlertTasks.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.25rem 1.5rem', 
            borderLeft: '4px solid var(--accent-rose)', 
            background: 'rgba(244, 63, 94, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
              <AlertTriangle size={20} />
              <span>URGENT DEADLINE ALERT: {urgentAlertTasks.length} Pending Item{urgentAlertTasks.length > 1 ? 's' : ''} Require Immediate Attention!</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Don't miss these deadlines!</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {urgentAlertTasks.map(t => {
              const st = getDeadlineStatus(t.deadline, false);
              return (
                <div 
                  key={t.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${st.color}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.title}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: `${st.color}20`, color: st.color }}>
                    {st.label}
                  </span>
                  {t.link && (
                    <a href={t.link} target="_blank" rel="noopener noreferrer" className="table-link" style={{ fontSize: '0.78rem' }}>
                      Open Link <ExternalLink size={12} />
                    </a>
                  )}
                  <button className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => onToggleStatus(t.id)}>
                    Mark Done <CheckCircle2 size={12} color="var(--accent-emerald)" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.pendingCount}</div>
            <div className="stat-lbl">Active Pending Tasks</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--accent-rose)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: stats.overdueCount > 0 ? 'var(--accent-rose)' : 'inherit' }}>
              {stats.overdueCount}
            </div>
            <div className="stat-lbl">Overdue Deadlines</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.dueTodayCount}</div>
            <div className="stat-lbl">Due Today / 24h</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
            <FileCheck2 size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.completedCount}</div>
            <div className="stat-lbl">Completed Works</div>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck2 size={22} color="var(--primary)" /> Pending Work & Application Vault
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Track forms, hackathon registrations, shop errands, and internship applications before deadlines pass.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="header-search" style={{ width: '220px' }}>
              <Search className="search-icon" size={16} />
              <input 
                type="text"
                placeholder="Search tasks & links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Dynamic Category Dropdown */}
            <select 
              className="form-select"
              style={{ width: '180px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {pendingCategories.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Load Samples button */}
            {tasks.length === 0 && onLoadSamples && (
              <button className="btn btn-secondary" onClick={onLoadSamples}>
                <Sparkles size={16} color="var(--accent-cyan)" /> Load Demo Pending List
              </button>
            )}

            {/* Add Task Button */}
            <button className="btn btn-primary" onClick={onAddTask}>
              <Plus size={16} /> Record Pending Work
            </button>
          </div>
        </div>

        {/* Filter Sub-Tabs */}
        <div className="view-options" style={{ width: 'fit-content' }}>
          <button 
            className={`view-btn ${filterTab === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterTab('pending')}
          >
            Pending / In Progress ({stats.pendingCount})
          </button>
          <button 
            className={`view-btn ${filterTab === 'urgent' ? 'active' : ''}`}
            onClick={() => setFilterTab('urgent')}
          >
            Urgent / Overdue ({stats.urgentCount})
          </button>
          <button 
            className={`view-btn ${filterTab === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterTab('completed')}
          >
            Completed ({stats.completedCount})
          </button>
          <button 
            className={`view-btn ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            All Items ({stats.total})
          </button>
        </div>
      </div>

      {/* TASK LIST CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredTasks.length === 0 ? (
          <div className="glass-panel empty-state">
            <AlertCircle size={40} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Pending Works Found</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {tasks.length === 0 ? 'Your pending work vault is clean! Click below to record a new task, hackathon form, or application.' : 'No items match your current filter.'}
            </p>
            <button className="btn btn-primary" onClick={onAddTask}>
              + Record Pending Work
            </button>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isDone = t.status === 'Completed';
            const deadlineStatus = getDeadlineStatus(t.deadline, isDone);
            const catColor = getCategoryColor(t.category);
            const deadlineFormatted = t.deadline 
              ? new Date(t.deadline).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
              : 'No deadline set';

            return (
              <div 
                key={t.id} 
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  borderLeft: `4px solid ${deadlineStatus.color}`,
                  opacity: isDone ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Left: Checkbox & Main Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', paddingTop: '2px' }}
                    onClick={() => onToggleStatus(t.id)}
                    title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 size={24} color="var(--accent-emerald)" />
                    ) : (
                      <Circle size={24} color="var(--text-dim)" />
                    )}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span 
                        style={{ 
                          fontWeight: 700, 
                          fontSize: '1.05rem', 
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? 'var(--text-muted)' : 'var(--text-main)' 
                        }}
                      >
                        {t.title}
                      </span>

                      {/* Dynamic Category Tag */}
                      <span 
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: catColor,
                          color: '#ffffff',
                          boxShadow: `0 0 8px ${catColor}40`
                        }}
                      >
                        {t.category}
                      </span>

                      {/* Priority Tag */}
                      {t.priority === 'High' && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.2)', color: 'var(--accent-rose)' }}>
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>

                    {/* Deadline Countdown & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color={deadlineStatus.color} />
                        <span>Deadline: <strong style={{ color: 'var(--text-main)' }}>{deadlineFormatted}</strong></span>
                      </div>

                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 800, 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          background: `${deadlineStatus.color}20`, 
                          color: deadlineStatus.color 
                        }}
                      >
                        {deadlineStatus.label}
                      </span>

                      {t.syncToCalendar && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> Synced to Calendar
                        </span>
                      )}
                    </div>

                    {/* Notes Snippet */}
                    {t.notes && (
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'pre-line' }}>
                        {t.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions & Portal Link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {t.link && (
                    <a 
                      href={t.link.startsWith('http') ? t.link : `https://${t.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
                    >
                      Open Form / Link <ExternalLink size={14} />
                    </a>
                  )}

                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px' }}
                    onClick={() => onEditTask(t)}
                    title="Edit task details"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button 
                    className="btn btn-danger"
                    style={{ padding: '6px 10px' }}
                    onClick={() => onDeleteTask(t.id)}
                    title="Delete task"
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
