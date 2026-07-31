import React, { useState, useMemo } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export default function IdeasVault({
  ideas = [],
  onAddIdea,
  onEditIdea,
  onDeleteIdea,
  onLoadSamples
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Filtered Ideas list
  const filteredIdeas = useMemo(() => {
    return ideas.filter(i => {
      const matchesSearch = 
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.content && i.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.implementationNotes && i.implementationNotes.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [ideas, searchTerm]);

  const handleCopyIdea = (item) => {
    const text = `${item.title}\n\n${item.content || item.implementationNotes || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* TOOLBAR CONTROLS */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={22} color="var(--accent-amber)" /> Free-Form Ideas Vault ({ideas.length})
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Write down any idea, thought, or note freely — no stage constraints or deadlines.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div className="header-search" style={{ width: '240px' }}>
            <Search className="search-icon" size={16} />
            <input 
              type="text"
              placeholder="Search ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {ideas.length === 0 && onLoadSamples && (
            <button className="btn btn-secondary" onClick={onLoadSamples}>
              <Sparkles size={16} color="var(--accent-cyan)" /> Load Demo Ideas
            </button>
          )}

          {/* Add Idea Button */}
          <button className="btn btn-primary" onClick={onAddIdea}>
            <Plus size={16} /> Capture New Idea
          </button>
        </div>
      </div>

      {/* IDEAS CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {filteredIdeas.length === 0 ? (
          <div className="glass-panel empty-state" style={{ gridColumn: '1 / -1' }}>
            <AlertCircle size={40} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Ideas Recorded</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {ideas.length === 0 ? 'Your idea vault is clean! Click below to write down your first idea or note.' : 'No ideas match your search.'}
            </p>
            <button className="btn btn-primary" onClick={onAddIdea}>
              + Capture New Idea
            </button>
          </div>
        ) : (
          filteredIdeas.map((item) => {
            const bodyContent = item.content || item.implementationNotes || '';

            return (
              <div 
                key={item.id} 
                className="glass-panel"
                style={{
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  justifyContent: 'space-between',
                  borderTop: '4px solid var(--accent-amber)'
                }}
              >
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.65rem' }}>
                    {item.title}
                  </h3>

                  {bodyContent ? (
                    <div 
                      style={{ 
                        background: 'var(--bg-glass)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-main)',
                        whiteSpace: 'pre-line',
                        lineHeight: '1.6',
                        maxHeight: '220px',
                        overflowY: 'auto'
                      }}
                    >
                      {bodyContent}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      No detailed notes attached.
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '5px 8px' }}
                      onClick={() => handleCopyIdea(item)}
                      title="Copy Idea Text"
                    >
                      {copiedId === item.id ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                    </button>

                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '5px 8px' }}
                      onClick={() => onEditIdea(item)}
                      title="Edit Idea"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '5px 8px' }}
                      onClick={() => onDeleteIdea(item.id)}
                      title="Delete Idea"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
