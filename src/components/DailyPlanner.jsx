import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ArrowRight, 
  Copy, 
  Sparkles, 
  CheckSquare, 
  FileText,
  Share2
} from 'lucide-react';

export default function DailyPlanner({ todos = [], onSaveTodos }) {
  // Selected date state. Default to today in YYYY-MM-DD format local time.
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  });

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Add form states
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium'); // 'High' | 'Medium' | 'Low'
  const [newCategory, setNewCategory] = useState('Personal'); // 'Personal' | 'Work' | 'Urgent' | 'Other'

  // Predefined Categories
  const categoriesList = ['Personal', 'Work', 'Urgent', 'Other'];
  
  // Format selected date nicely for title
  const formattedSelectedDate = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, [selectedDate]);

  // Navigate date helper
  const changeDateByDays = (days) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    const offset = current.getTimezoneOffset();
    const localNewDate = new Date(current.getTime() - (offset * 60 * 1000));
    setSelectedDate(localNewDate.toISOString().split('T')[0]);
  };

  // Jump to today
  const jumpToToday = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    setSelectedDate(localToday.toISOString().split('T')[0]);
  };

  // Filtered todos for current selected date
  const selectedDayTodos = useMemo(() => {
    return todos.filter(t => t.date === selectedDate);
  }, [todos, selectedDate]);

  // Statistics for selected day
  const stats = useMemo(() => {
    const total = selectedDayTodos.length;
    const completed = selectedDayTodos.filter(t => t.status === 'Completed').length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percentage };
  }, [selectedDayTodos]);

  // Add todo handler
  const handleAddTodo = (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const newTodo = {
      id: 'todo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      title: newTitle.trim(),
      date: selectedDate,
      status: 'Pending',
      priority: newPriority,
      category: newCategory,
      createdAt: new Date().toISOString()
    };

    onSaveTodos([newTodo, ...todos]);
    setNewTitle('');
  };

  // Toggle status
  const handleToggleStatus = (id) => {
    const updated = todos.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' };
      }
      return t;
    });
    onSaveTodos(updated);
  };

  // Delete todo
  const handleDeleteTodo = (id) => {
    const updated = todos.filter(t => t.id !== id);
    onSaveTodos(updated);
  };

  // Start inline editing
  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.title);
  };

  // Save inline edit
  const saveEditing = (id) => {
    if (!editingText.trim()) return;
    const updated = todos.map(t => {
      if (t.id === id) {
        return { ...t, title: editingText.trim() };
      }
      return t;
    });
    onSaveTodos(updated);
    setEditingId(null);
    setEditingText('');
  };

  // Copy Unfinished Tasks from Yesterday
  const copyUnfinishedFromYesterday = () => {
    // Find yesterday date
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() - 1);
    const offset = current.getTimezoneOffset();
    const localNewDate = new Date(current.getTime() - (offset * 60 * 1000));
    const yesterdayStr = localNewDate.toISOString().split('T')[0];

    // Find yesterday's pending todos
    const yesterdayPending = todos.filter(t => t.date === yesterdayStr && t.status !== 'Completed');

    if (yesterdayPending.length === 0) {
      alert('No pending tasks found from yesterday!');
      return;
    }

    // Clone them with today's date and a fresh ID
    const copiedTodos = yesterdayPending.map(t => ({
      ...t,
      id: 'todo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      createdAt: new Date().toISOString()
    }));

    onSaveTodos([...copiedTodos, ...todos]);
  };

  // Move Uncompleted Tasks to Tomorrow
  const moveUncompletedToTomorrow = () => {
    // Find tomorrow's date
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + 1);
    const offset = current.getTimezoneOffset();
    const localNewDate = new Date(current.getTime() - (offset * 60 * 1000));
    const tomorrowStr = localNewDate.toISOString().split('T')[0];

    let movedCount = 0;
    const updated = todos.map(t => {
      if (t.date === selectedDate && t.status !== 'Completed') {
        movedCount++;
        return { ...t, date: tomorrowStr };
      }
      return t;
    });

    if (movedCount === 0) {
      alert('No uncompleted tasks to move on this day!');
      return;
    }

    onSaveTodos(updated);
  };

  // Clear completed tasks on selected day
  const clearCompletedForDay = () => {
    const updated = todos.filter(t => !(t.date === selectedDate && t.status === 'Completed'));
    onSaveTodos(updated);
  };

  // Share daily agenda to clipboard
  const shareDailyAgenda = () => {
    if (selectedDayTodos.length === 0) {
      alert('Your list is empty! Add tasks first before sharing.');
      return;
    }

    let shareText = `📅 *OmniSync Agenda for ${formattedSelectedDate}*\n`;
    shareText += `Progress: ${stats.completed}/${stats.total} (${stats.percentage}% Completed)\n\n`;
    
    selectedDayTodos.forEach((t, i) => {
      const bullet = t.status === 'Completed' ? '✅' : '⬜';
      const priorityTag = t.priority === 'High' ? ' 🔥' : '';
      shareText += `${i + 1}. ${bullet} ${t.title} [${t.category}]${priorityTag}\n`;
    });

    navigator.clipboard.writeText(shareText)
      .then(() => alert('Daily agenda copied to clipboard in markdown format!'))
      .catch(err => console.error('Failed to copy text: ', err));
  };

  // Get Priority Badge Styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.3)' };
      case 'Medium':
        return { background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'Low':
      default:
        return { background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.3)' };
    }
  };

  // Get Category Badge Color
  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Work':
        return 'rgba(34, 211, 238, 0.12)';
      case 'Urgent':
        return 'rgba(244, 63, 94, 0.12)';
      case 'Other':
        return 'rgba(100, 116, 139, 0.15)';
      case 'Personal':
      default:
        return 'rgba(168, 85, 247, 0.12)';
    }
  };

  // Custom Category Text Color
  const getCategoryTextColor = (category) => {
    switch (category) {
      case 'Work':
        return 'var(--accent-cyan)';
      case 'Urgent':
        return 'var(--accent-rose)';
      case 'Other':
        return 'var(--text-muted)';
      case 'Personal':
      default:
        return 'var(--accent-purple)';
    }
  };

  // Encouragement text generator
  const encouragementText = useMemo(() => {
    if (stats.total === 0) return 'All quiet for today. Ready to schedule your day? ✍️';
    if (stats.percentage === 100) return 'Incredible! You completed all tasks! Day Won! 🔥';
    if (stats.percentage >= 75) return 'Almost there! Push a bit more to crush it! 🚀';
    if (stats.percentage >= 50) return 'Halfway through. Excellent momentum! ⚡';
    if (stats.percentage > 0) return 'Good start! One step at a time. 📈';
    return 'Morning planning complete. Time to execute! 🎯';
  }, [stats]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', paddingBottom: '2rem' }}>
      
      {/* HEADER SECTION: DATE SELECTOR & NAVIGATION */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => changeDateByDays(-1)} 
              style={{ padding: '6px 8px', border: 'none', background: 'transparent', borderRadius: '6px' }}
              title="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={jumpToToday} 
              style={{ padding: '6px 12px', border: 'none', background: 'transparent', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}
            >
              Today
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => changeDateByDays(1)} 
              style={{ padding: '6px 8px', border: 'none', background: 'transparent', borderRadius: '6px' }}
              title="Next Day"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 10px', height: '34px' }}>
            <Calendar size={14} color="var(--primary)" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-main)', 
                fontSize: '0.8rem', 
                fontFamily: 'var(--font-main)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
            {formattedSelectedDate}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Command Planner</span>
        </div>
      </div>


      {/* THREE-COLUMN WORKSPACE: LEFT = QUICK CAPTURE FORM, RIGHT = MAIN TODOS WORKLIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: QUICK CAPTURE CARD */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={16} color="var(--primary)" />
              <span>Capture New Task</span>
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Draft daily action items directly into today's timeline</p>
          </div>

          <form onSubmit={handleAddTodo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Title</label>
              <input 
                type="text"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</label>
                <select
                  className="form-select"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Low" style={{ background: 'var(--bg-dark)', color: 'var(--text-main)' }}>Low</option>
                  <option value="Medium" style={{ background: 'var(--bg-dark)', color: 'var(--text-main)' }}>Medium</option>
                  <option value="High" style={{ background: 'var(--bg-dark)', color: 'var(--text-main)' }}>High</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</label>
                <select
                  className="form-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat} style={{ background: 'var(--bg-dark)', color: 'var(--text-main)' }}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              <span>Add to Agenda</span>
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Smart Carry-over</div>
            <button 
              className="btn btn-secondary" 
              onClick={copyUnfinishedFromYesterday}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid var(--border-color)',
                background: 'transparent'
              }}
            >
              <Copy size={14} color="var(--primary)" />
              <span>Import Pending from Yesterday</span>
            </button>

            <button 
              className="btn btn-secondary" 
              onClick={moveUncompletedToTomorrow}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid var(--border-color)',
                background: 'transparent'
              }}
            >
              <ArrowRight size={14} color="var(--accent-amber)" />
              <span>Postpone Unfinished to Tomorrow</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN TODOS LIST */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--primary)" />
                <span>Daily Agenda Worklist</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Items planned for this date</p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={shareDailyAgenda}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', background: 'transparent' }}
                title="Share agenda (copy as markdown)"
              >
                <Share2 size={12} />
                <span>Share</span>
              </button>
              {stats.completed > 0 && (
                <button 
                  onClick={clearCompletedForDay}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.15)', background: 'transparent' }}
                >
                  Clear Completed
                </button>
              )}
            </div>
          </div>

          {/* MAIN CHECKLIST CONTROLLER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1, minHeight: '260px' }}>
            {selectedDayTodos.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '12px', background: 'rgba(0,0,0,0.05)' }}>
                <CheckSquare size={36} color="var(--text-dim)" style={{ opacity: 0.3, marginBottom: '8px' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Your workspace is clear for this day!</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Draft tasks on the left to start planning.</span>
              </div>
            ) : (
              selectedDayTodos.map((todo) => {
                const isEditing = editingId === todo.id;
                const isCompleted = todo.status === 'Completed';
                
                return (
                  <div 
                    key={todo.id}
                    className="glass-panel"
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      borderLeft: isCompleted ? '3px solid var(--accent-emerald)' : '3px solid var(--primary)',
                      background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-card)',
                      transition: 'transform 0.15s ease, background 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    
                    {/* CHECKBOX TRIGGER */}
                    <button 
                      onClick={() => handleToggleStatus(todo.id)}
                      style={{
                        background: isCompleted ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.02)',
                        border: isCompleted ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isCompleted ? '0 0 8px rgba(16,185,129,0.3)' : 'none',
                      }}
                    >
                      {isCompleted && <Check size={12} color="white" strokeWidth={3} />}
                    </button>

                    {/* INLINE EDIT INPUT OR VIEW TEXT */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditing(todo.id)}
                            style={{
                              flex: 1,
                              background: 'var(--bg-glass)',
                              border: '1px solid var(--primary)',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '0.85rem',
                              color: 'var(--text-main)',
                              outline: 'none'
                            }}
                            autoFocus
                          />
                          <button 
                            onClick={() => saveEditing(todo.id)}
                            style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span 
                            onDoubleClick={() => startEditing(todo)}
                            style={{
                              fontSize: '0.85rem',
                              color: isCompleted ? 'var(--text-dim)' : 'var(--text-main)',
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              wordBreak: 'break-word',
                              cursor: 'pointer',
                              fontWeight: isCompleted ? 500 : 600,
                              lineHeight: '1.25rem'
                            }}
                          >
                            {todo.title}
                          </span>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            {/* Priority Badge */}
                            <span 
                              style={{ 
                                fontSize: '0.62rem', 
                                fontWeight: 800, 
                                padding: '1px 6px', 
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                                ...getPriorityStyle(todo.priority)
                              }}
                            >
                              {todo.priority}
                            </span>
                            
                            {/* Category Badge */}
                            <span 
                              style={{ 
                                fontSize: '0.62rem', 
                                fontWeight: 800, 
                                padding: '1px 6px', 
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                                background: getCategoryBadgeColor(todo.category),
                                color: getCategoryTextColor(todo.category),
                                border: `1px solid ${getCategoryTextColor(todo.category)}25`
                              }}
                            >
                              {todo.category}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACTION CONTROLS */}
                    <div style={{ display: 'flex', gap: '6px', opacity: isEditing ? 0 : 1, transition: 'opacity 0.2s' }}>
                      <button 
                        onClick={() => startEditing(todo)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-dim)',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'color 0.15s, background 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'none'; }}
                        title="Edit Task"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button 
                        onClick={() => handleDeleteTodo(todo.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-dim)',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'color 0.15s, background 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-rose)'; e.currentTarget.style.background = 'rgba(244,63,94,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'none'; }}
                        title="Delete Task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
