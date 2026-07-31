import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Clock, AlertTriangle, Link as LinkIcon, FileText, Tag, Trash2 } from 'lucide-react';

const PRIORITIES = [
  { label: 'High / Critical', value: 'High', color: '#f43f5e' },
  { label: 'Medium', value: 'Medium', color: '#f59e0b' },
  { label: 'Low', value: 'Low', color: '#3b82f6' }
];

const STATUSES = ['Pending', 'In Progress', 'Completed'];

export default function PendingTaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  pendingCategories = [],
  initialTask = null
}) {
  if (!isOpen) return null;

  const defaultCatName = pendingCategories.length > 0 
    ? pendingCategories[0].name 
    : 'Hackathon Registration';

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: defaultCatName,
    deadline: '',
    priority: 'High',
    status: 'Pending',
    link: '',
    notes: '',
    syncToCalendar: true
  });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        id: initialTask.id || '',
        title: initialTask.title || '',
        category: initialTask.category || defaultCatName,
        deadline: initialTask.deadline ? initialTask.deadline.slice(0, 16) : '',
        priority: initialTask.priority || 'High',
        status: initialTask.status || 'Pending',
        link: initialTask.link || '',
        notes: initialTask.notes || '',
        syncToCalendar: initialTask.syncToCalendar ?? true
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const deadlineStr = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      setFormData({
        id: '',
        title: '',
        category: defaultCatName,
        deadline: deadlineStr,
        priority: 'High',
        status: 'Pending',
        link: '',
        notes: '',
        syncToCalendar: true
      });
    }
  }, [initialTask, isOpen, pendingCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...formData,
      id: formData.id || 'ptask-' + Date.now(),
      reminderTriggered: false,
      createdAt: initialTask?.createdAt || new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--accent-cyan)" />
            {initialTask ? 'Edit Pending Application / Task' : 'Record New Pending Work'}
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
            {/* Task / Application Title */}
            <div className="form-group">
              <label className="form-label">Task / Application Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Hackathon Form Submission, Internship Application, Buy Controller from Shop..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Dynamic Category & Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={14} /> Category
                </label>
                <select 
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {pendingCategories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select 
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deadline & Status */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> Deadline Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Status</label>
                <select 
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Link URL */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LinkIcon size={14} /> Form / Application / Portal Link
              </label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://... (portal link, registration form, shop address URL)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} /> Notes / Required Submissions
              </label>
              <textarea 
                className="form-textarea" 
                rows="3"
                placeholder="e.g. Upload resume PDF, fill team member details, bring receipt to shop..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Sync to Calendar Option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <input 
                type="checkbox" 
                id="syncCal"
                checked={formData.syncToCalendar}
                onChange={(e) => setFormData({ ...formData, syncToCalendar: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="syncCal" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="var(--primary)" /> Sync deadline to Main Interactive Calendar
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <div>
              {initialTask && onDelete && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(initialTask.id);
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
                <Check size={16} /> {initialTask ? 'Save Changes' : 'Record Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
