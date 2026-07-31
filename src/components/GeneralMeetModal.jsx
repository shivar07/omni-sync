import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Link as LinkIcon, FileText, Tag, Trash2, Clock, Globe } from 'lucide-react';
import { MEET_PLATFORMS } from '../utils/storage';

export default function GeneralMeetModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialMeet = null
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    platform: MEET_PLATFORMS[0],
    startDate: '',
    endDate: '',
    link: '',
    isLinkPending: false,
    notes: ''
  });

  useEffect(() => {
    if (initialMeet) {
      setFormData({
        id: initialMeet.id || '',
        title: initialMeet.title || '',
        platform: initialMeet.platform || MEET_PLATFORMS[0],
        startDate: initialMeet.startDate || '',
        endDate: initialMeet.endDate || '',
        link: initialMeet.link || '',
        isLinkPending: initialMeet.isLinkPending || false,
        notes: initialMeet.notes || ''
      });
    } else {
      const defaultStart = new Date();
      defaultStart.setMinutes(defaultStart.getMinutes() + 120);
      const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);

      const formatDt = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${mins}`;
      };

      setFormData({
        id: '',
        title: '',
        platform: MEET_PLATFORMS[0],
        startDate: formatDt(defaultStart),
        endDate: formatDt(defaultEnd),
        link: '',
        isLinkPending: false,
        notes: ''
      });
    }
  }, [initialMeet, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) return;

    onSave({
      ...formData,
      id: formData.id || 'gmeet-' + Date.now(),
      reminderTriggered: false,
      createdAt: initialMeet?.createdAt || new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color="var(--accent-cyan)" />
            {initialMeet ? 'Edit General Meet / Event' : 'Schedule General Meet / Event'}
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
            {/* Meet Title */}
            <div className="form-group">
              <label className="form-label">Meet / Event Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. AI Keynote, Web3 Developer Sync, Luma Community Meet..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Platform Selection & Link Toggle */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={14} /> Platform / Source
                </label>
                <select 
                  className="form-select"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  {MEET_PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ justifyContent: 'center' }}>
                <label className="form-label">Link Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '6px' }}>
                  <input 
                    type="checkbox"
                    id="isLinkPending"
                    checked={formData.isLinkPending}
                    onChange={(e) => setFormData({ ...formData, isLinkPending: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
                  />
                  <label htmlFor="isLinkPending" style={{ fontSize: '0.825rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                    Link Pending (Released on date)
                  </label>
                </div>
              </div>
            </div>

            {/* Meet Link URL (Optional if Link Pending) */}
            {!formData.isLinkPending && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LinkIcon size={14} /> Event / Join URL Link (Optional)
                </label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://zoom.us/j/... or https://lu.ma/..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
            )}

            {/* Date & Times */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Start Date & Time
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
                  <Clock size={14} /> End Time
                </label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} /> Notes / Registration Confirmation Info
              </label>
              <textarea 
                className="form-textarea" 
                rows="3"
                placeholder="e.g. Registered on Luma, email confirmation received, link to be released 10 mins before start..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <div>
              {initialMeet && onDelete && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(initialMeet.id);
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
                <Check size={16} /> {initialMeet ? 'Save Changes' : 'Schedule Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
