import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Calendar, Clock, Link as LinkIcon, Tag, Bell, FileText, Trash2, Check } from 'lucide-react';

const REMINDERS = [
  '15 mins before',
  '30 mins before',
  '1 hour before',
  '2 hours before',
  '1 day before'
];

export default function EventModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  categories = [], 
  initialEvent = null, 
  defaultDate = null 
}) {
  if (!isOpen) return null;

  const defaultCategoryName = categories.length > 0 ? categories[0].name : 'Workshop';

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: defaultCategoryName,
    startDate: '',
    endDate: '',
    link: '',
    notes: '',
    reminder: '1 hour before'
  });

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        id: initialEvent.id || '',
        title: initialEvent.title || '',
        category: initialEvent.category || defaultCategoryName,
        startDate: initialEvent.startDate ? initialEvent.startDate.slice(0, 16) : '',
        endDate: initialEvent.endDate ? initialEvent.endDate.slice(0, 16) : '',
        link: initialEvent.link || '',
        notes: initialEvent.notes || '',
        reminder: initialEvent.reminder || '1 hour before'
      });
    } else {
      const baseDate = defaultDate ? new Date(defaultDate) : new Date();
      if (defaultDate) {
        const now = new Date();
        baseDate.setHours(now.getHours());
        baseDate.setMinutes(now.getMinutes());
        baseDate.setSeconds(now.getSeconds());
      }
      const startStr = new Date(baseDate.getTime() - baseDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      const endDateObj = new Date(baseDate.getTime() + 60 * 60 * 1000);
      const endStr = new Date(endDateObj.getTime() - endDateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      setFormData({
        id: '',
        title: '',
        category: defaultCategoryName,
        startDate: startStr,
        endDate: endStr,
        link: '',
        notes: '',
        reminder: '1 hour before'
      });
    }
  }, [initialEvent, defaultDate, isOpen, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...formData,
      id: formData.id || 'evt-' + Date.now(),
      reminderTriggered: false,
      createdAt: initialEvent?.createdAt || new Date().toISOString()
    });
    onClose();
  };

  const handleTestLink = () => {
    if (!formData.link) return;
    let url = formData.link.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--primary)" />
            {initialEvent ? 'Edit Event Schedule' : 'Schedule New Event'}
          </div>
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Event Title */}
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. AI & Data Science Workshop 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Category / Type (Dynamic Tags) */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} /> Event Category / Ingestion Tag
              </label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates & Times */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> Start Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> End Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Link URL */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LinkIcon size={14} /> Event / Meeting Link (Zoom, Meet, Web URL)
                </label>
                {formData.link && (
                  <button 
                    type="button" 
                    className="table-link"
                    onClick={handleTestLink}
                    style={{ fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Test Link <ExternalLink size={12} />
                  </button>
                )}
              </div>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>

            {/* Reminder Preference */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={14} /> Reminder Preference
              </label>
              <select 
                className="form-select"
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
              >
                {REMINDERS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Schedule Notes */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} /> Schedule Notes & Description (Paste Email / WhatsApp details)
              </label>
              <textarea 
                className="form-textarea" 
                rows="4"
                placeholder="Paste full WhatsApp message, email agenda, key note speaker details, or prep instructions here..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <div>
              {initialEvent && onDelete && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(initialEvent.id);
                    onClose();
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> {initialEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
