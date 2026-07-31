import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Copy, 
  FileSpreadsheet, 
  Check, 
  Tag, 
  Clock, 
  Bell, 
  Layers,
  AlertCircle
} from 'lucide-react';

export default function TaskSummaryTable({ events, categories = [], onEditEvent, onDeleteEvent, onQuickAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  // Helper map for category colors
  const categoryColorMap = useMemo(() => {
    const map = {};
    categories.forEach(c => {
      map[c.name] = c.color || '#3b82f6';
    });
    return map;
  }, [categories]);

  const getCategoryColor = (catName) => {
    return categoryColorMap[catName] || '#3b82f6';
  };

  // Compute analytics
  const stats = useMemo(() => {
    const total = events.length;
    const linksCount = events.filter(e => e.link && e.link.trim() !== '').length;
    
    // Category distribution map
    const distribution = events.reduce((acc, evt) => {
      const cat = evt.category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return { total, linksCount, distribution };
  }, [events]);

  // Filtered list
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesSearch = 
        evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evt.notes && evt.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evt.link && evt.link.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCat = categoryFilter === 'All' || evt.category === categoryFilter;

      return matchesSearch && matchesCat;
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [events, searchTerm, categoryFilter]);

  const handleCopySingleTxt = (evt) => {
    const text = `EVENT: ${evt.title}\nCategory: ${evt.category}\nDate: ${new Date(evt.startDate).toLocaleString()}\nLink: ${evt.link || 'None'}\nReminder: ${evt.reminder}\nNotes: ${evt.notes || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(evt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToCsv = () => {
    let csv = 'ID,Title,Category,Start Date,End Date,Link,Reminder,Notes\n';
    events.forEach(e => {
      const title = `"${(e.title || '').replace(/"/g, '""')}"`;
      const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;
      const link = `"${(e.link || '').replace(/"/g, '""')}"`;
      csv += `${e.id},${title},${e.category},${e.startDate},${e.endDate},${link},${e.reminder},${notes}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniSync_Summary_Table_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="summary-container">
      {/* Stat Cards Row */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-lbl">Total Schedule Tasks</div>
          </div>
        </div>

        {categories.slice(0, 3).map((cat) => {
          const count = stats.distribution[cat.name] || 0;
          return (
            <div key={cat.id || cat.name} className="glass-panel stat-card">
              <div 
                className="stat-icon-wrapper" 
                style={{ 
                  background: `${cat.color || '#3b82f6'}20`, 
                  color: cat.color || '#3b82f6' 
                }}
              >
                <Tag size={22} />
              </div>
              <div>
                <div className="stat-val">{count}</div>
                <div className="stat-lbl">{cat.name} Events</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} color="var(--primary)" /> Tag Distribution Summary
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {stats.linksCount} events have direct links attached
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
          {Object.entries(stats.distribution).map(([cat, count]) => {
            const color = getCategoryColor(cat);

            return (
              <div 
                key={cat}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem'
                }}
              >
                <span className="category-chip" style={{ backgroundColor: color, color: '#ffffff' }}>
                  {cat}
                </span>
                <strong style={{ color: 'var(--text-main)' }}>{count}</strong>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  ({Math.round((count / (stats.total || 1)) * 100)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Table Control Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>
              Tabular Schedule Overview
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Complete tabular listing of all tasks, workshops, links & schedule details
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="header-search" style={{ width: '220px' }}>
              <Search className="search-icon" size={16} />
              <input 
                type="text"
                placeholder="Search table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Dynamic Category Select */}
            <select 
              className="form-select"
              style={{ width: '160px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Export CSV */}
            <button className="btn btn-secondary" onClick={exportToCsv} title="Export Table as CSV">
              <FileSpreadsheet size={16} /> Export CSV
            </button>

            {/* Add Event */}
            <button className="btn btn-primary" onClick={onQuickAdd}>
              + Add Event
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date & Time</th>
                <th>Event / Task Title</th>
                <th>Category Tag</th>
                <th>Event Link</th>
                <th>Reminder</th>
                <th>Notes / Details</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={32} opacity={0.5} />
                      <div>No schedule events found matching filter.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt, idx) => {
                  const startStr = new Date(evt.startDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                  const catColor = getCategoryColor(evt.category);

                  return (
                    <tr key={evt.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-dim)' }}>{idx + 1}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                          <Clock size={14} color="var(--primary)" />
                          {startStr}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, maxWidth: '200px' }}>
                        {evt.title}
                      </td>
                      <td>
                        <span className="category-chip" style={{ backgroundColor: catColor, color: '#ffffff' }}>
                          {evt.category || 'General'}
                        </span>
                      </td>
                      <td>
                        {evt.link ? (
                          <a 
                            href={evt.link.startsWith('http') ? evt.link : `https://${evt.link}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="table-link"
                          >
                            Launch Link <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No link</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Bell size={12} />
                          {evt.reminder || 'Default'}
                        </div>
                      </td>
                      <td style={{ maxWidth: '240px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {evt.notes || '—'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px' }} 
                            onClick={() => handleCopySingleTxt(evt)}
                            title="Copy event summary TXT"
                          >
                            {copiedId === evt.id ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px' }}
                            onClick={() => onEditEvent(evt)}
                            title="Edit Event"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 10px' }}
                            onClick={() => onDeleteEvent(evt.id)}
                            title="Delete Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
