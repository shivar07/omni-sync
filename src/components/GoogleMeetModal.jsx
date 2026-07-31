import React, { useState, useEffect } from 'react';
import { X, Check, Video, Link as LinkIcon, FileText, Calendar, Trash2, ShieldAlert } from 'lucide-react';

export default function GoogleMeetModal({
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
    link: '',
    startDate: '',
    endDate: '',
    notes: '',
    isImportant: true
  });

  useEffect(() => {
    if (initialMeet) {
      setFormData({
        id: initialMeet.id || '',
        title: initialMeet.title || '',
        link: initialMeet.link || '',
        startDate: initialMeet.startDate || '',
        endDate: initialMeet.endDate || '',
        notes: initialMeet.notes || '',
        isImportant: initialMeet.isImportant !== false
      });
    } else {
      const defaultStart = new Date();
      defaultStart.setMinutes(defaultStart.getMinutes() + 60);
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
        link: '',
        startDate: formatDt(defaultStart),
        endDate: formatDt(defaultEnd),
        notes: '',
        isImportant: true
      });
    }
  }, [initialMeet, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) return;

    onSave({
      ...formData,
      id: formData.id || 'meet-' + Date.now(),
      reminderTriggered: false,
      createdAt: initialMeet?.createdAt || new Date().toISOString()
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
            <Video size={20} color="#00ac47" />
            {initialMeet ? 'Edit Personal Google Meet' : 'Schedule Important Google Meet'}
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
              <label className="form-label">Google Meet Title / Purpose</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Personal Mentor Review, Urgent Pitch Discussion..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Google Meet URL Link */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LinkIcon size={14} color="#00ac47" /> Google Meet Link
                </label>
                {formData.link && (
                  <button 
                    type="button" 
                    className="table-link"
                    onClick={handleTestLink}
                    style={{ fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#00ac47' }}
                  >
                    Test Meet Link
                  </button>
                )}
              </div>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://meet.google.com/abc-defg-hij"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                required
              />
            </div>

            {/* Date & Start/End Times */}
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
                  <Calendar size={14} /> End Time
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
                <FileText size={14} /> Meeting Agenda & Notes
              </label>
              <textarea 
                className="form-textarea" 
                rows="3"
                placeholder="Key topics to discuss, docs to open, or agenda items..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Important Glow Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0' }}>
              <input 
                type="checkbox"
                id="isImportant"
                checked={formData.isImportant}
                onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#00ac47' }}
              />
              <label htmlFor="isImportant" style={{ fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} color="#00ac47" /> Enable Animated Glow Reflection on Calendar
              </label>
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
              <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #00ac47, #008332)' }}>
                <Check size={16} /> {initialMeet ? 'Save Changes' : 'Schedule Google Meet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
