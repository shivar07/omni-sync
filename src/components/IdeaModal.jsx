import React, { useState, useEffect } from 'react';
import { X, Check, Lightbulb, Trash2 } from 'lucide-react';

export default function IdeaModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialIdea = null
}) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (initialIdea) {
      setTitle(initialIdea.title || '');
      setContent(initialIdea.content || initialIdea.implementationNotes || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [initialIdea, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    onSave({
      id: initialIdea?.id || 'idea-' + Date.now(),
      title: title.trim() || 'Untitled Idea',
      content: content.trim(),
      createdAt: initialIdea?.createdAt || new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={20} color="var(--accent-amber)" />
            {initialIdea ? 'Edit Idea' : 'Capture New Idea'}
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
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Idea Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="What's your idea title?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Free-form Content Box */}
            <div className="form-group">
              <label className="form-label">Idea Notes / Details</label>
              <textarea 
                className="form-textarea" 
                rows="7"
                placeholder="Write your idea, thought, plan, or notes here freely..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <div>
              {initialIdea && onDelete && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(initialIdea.id);
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
                <Check size={16} /> {initialIdea ? 'Save Changes' : 'Save Idea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
