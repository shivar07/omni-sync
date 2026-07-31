import React, { useState, useEffect } from 'react';
import { X, Check, Briefcase, Link as LinkIcon, FileText, Tag, Trash2, Layers, Calendar, Bell } from 'lucide-react';
import { APPLICATION_CATEGORIES, APPLICATION_STATUSES } from '../utils/storage';

export default function ApplicationModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialApplication = null
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: APPLICATION_CATEGORIES[0],
    status: 'Submitted',
    link: '',
    notes: '',
    appliedDate: '',
    reminderDate: ''
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    if (initialApplication) {
      setFormData({
        id: initialApplication.id || '',
        title: initialApplication.title || '',
        category: initialApplication.category || APPLICATION_CATEGORIES[0],
        status: initialApplication.status || 'Submitted',
        link: initialApplication.link || '',
        notes: initialApplication.notes || '',
        appliedDate: initialApplication.appliedDate ? initialApplication.appliedDate.split('T')[0] : today,
        reminderDate: initialApplication.reminderDate || ''
      });
    } else {
      const reminderDt = new Date();
      reminderDt.setDate(reminderDt.getDate() + 7); // 7 days from now
      const reminderStr = new Date(reminderDt.getTime() - reminderDt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      setFormData({
        id: '',
        title: '',
        category: APPLICATION_CATEGORIES[0],
        status: 'Submitted',
        link: '',
        notes: '',
        appliedDate: today,
        reminderDate: reminderStr
      });
    }
  }, [initialApplication, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...formData,
      id: formData.id || 'app-' + Date.now(),
      reminderTriggered: false,
      appliedDate: formData.appliedDate ? new Date(formData.appliedDate).toISOString() : new Date().toISOString()
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
            <Briefcase size={20} color="var(--primary)" />
            {initialApplication ? 'Edit Applied Application' : 'Record Submitted Application'}
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
            {/* Title / Company / Program */}
            <div className="form-group">
              <label className="form-label">Role / Company / Program Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Google Software Engineering Intern, Stripe Product Design..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Category & Status */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={14} /> Application Type
                </label>
                <select 
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {APPLICATION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} /> Progress Status
                </label>
                <select 
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {APPLICATION_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates (Submission Date & Follow-Up Reminder Date) */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Applied / Submission Date
                </label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} /> Optional Expected Date of Reminder
                </label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={formData.reminderDate}
                  onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                />
              </div>
            </div>

            {/* Portal Link */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LinkIcon size={14} /> Application / Status Portal Link
                </label>
                {formData.link && (
                  <button 
                    type="button" 
                    className="table-link"
                    onClick={handleTestLink}
                    style={{ fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Open Portal
                  </button>
                )}
              </div>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://careers.company.com/portal/status/..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                required
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} /> Notes / Confirmation ID / Follow-up Details
              </label>
              <textarea 
                className="form-textarea" 
                rows="3"
                placeholder="e.g. Confirmation ID: #GOOG-8891, referral used, resume V2 attached..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <div>
              {initialApplication && onDelete && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(initialApplication.id);
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
                <Check size={16} /> {initialApplication ? 'Save Changes' : 'Record Application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
