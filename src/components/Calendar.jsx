import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ExternalLink, 
  Video,
  Send,
  Bell
} from 'lucide-react';

export default function Calendar({ 
  events = [], 
  categories = [], 
  onSelectEvent, 
  onAddEventOnDate,
  searchTerm = ''
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day', 'agenda'
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Category Color Lookup Map
  const categoryColorMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.name] = cat.color;
    });
    return map;
  }, [categories]);

  const getCategoryColor = (catName) => {
    return categoryColorMap[catName] || '#3b82f6';
  };

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addDays(currentDate, -7));
    else if (viewMode === 'day') setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addDays(currentDate, 7));
    else if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
      const matchesSearch = 
        !searchTerm ||
        evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evt.notes && evt.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evt.category && evt.category.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchTerm]);

  // Month Days Calculation
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // Week Days Calculation
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = (day) => {
    return filteredEvents.filter((evt) => {
      if (!evt.startDate) return false;
      const evtDate = new Date(evt.startDate);
      return isSameDay(evtDate, day);
    });
  };

  const getEventChipClass = (evt) => {
    if (evt.isMeet || evt.isImportantMeet || evt.category === 'Google Meet (Personal)' || (evt.link && evt.link.includes('meet.google.com'))) {
      return 'event-chip meet-glowing';
    }
    if (evt.isAppSubmitted) {
      return 'event-chip app-submitted';
    }
    if (evt.isAppReminder) {
      return 'event-chip app-reminder-glow';
    }
    return 'event-chip';
  };

  const hasSpecialStyle = (evt) => {
    return evt.isMeet || evt.isImportantMeet || evt.category === 'Google Meet (Personal)' || (evt.link && evt.link.includes('meet.google.com')) || evt.isAppSubmitted || evt.isAppReminder;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Calendar Toolbar Controls */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem' }}>
        <div className="calendar-controls">
          {/* Navigation */}
          <div className="date-nav">
            <button className="btn btn-secondary" style={{ padding: '0.45rem 0.75rem' }} onClick={handleToday}>
              Today
            </button>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn btn-secondary" style={{ padding: '0.45rem' }} onClick={handlePrev}>
                <ChevronLeft size={18} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.45rem' }} onClick={handleNext}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="current-date-title">
              {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
            </div>
          </div>

          {/* View Switcher */}
          <div className="view-options">
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button 
              className={`view-btn ${viewMode === 'agenda' ? 'active' : ''}`}
              onClick={() => setViewMode('agenda')}
            >
              Agenda List
            </button>
          </div>
        </div>

        {/* Dynamic Category Filters Pill Row */}
        <div className="category-filters" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, marginRight: '6px' }}>Filter:</span>
          
          <button
            className={`filter-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id || cat.name}
              className={`filter-pill ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <span className="badge-dot" style={{ backgroundColor: cat.color || '#3b82f6', boxShadow: `0 0 8px ${cat.color || '#3b82f6'}` }} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="calendar-header-day">
              {d}
            </div>
          ))}

          {monthDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={idx}
                className={`calendar-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isDayToday ? 'today' : ''}`}
                onClick={() => onAddEventOnDate(day)}
              >
                <div className="day-number-header">
                  <span className="day-number">{format(day, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <span className="event-count-badge">{dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}</span>
                  )}
                </div>

                <div className="day-events-list">
                  {dayEvents.map((evt) => {
                    const isSpecial = hasSpecialStyle(evt);
                    const chipClass = getEventChipClass(evt);
                    const catColor = getCategoryColor(evt.category);

                    return (
                      <div
                        key={evt.id}
                        className={chipClass}
                        style={isSpecial ? {} : {
                          backgroundColor: catColor,
                          color: '#ffffff',
                          boxShadow: `0 0 8px ${catColor}40`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        title={`${evt.title} (${evt.category || 'Event'}) - Click to view`}
                      >
                        {evt.isMeet && <Video size={11} style={{ marginRight: '3px', flexShrink: 0 }} />}
                        {evt.isAppSubmitted && <Send size={11} style={{ marginRight: '3px', flexShrink: 0 }} />}
                        {evt.isAppReminder && <Bell size={11} style={{ marginRight: '3px', flexShrink: 0 }} />}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {evt.title}
                        </span>
                        {evt.link && <ExternalLink size={10} style={{ opacity: 0.8 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEEK VIEW GRID */}
      {viewMode === 'week' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '1rem' }}>
            {weekDays.map((day) => {
              const dayEvts = getEventsForDay(day);
              const isDayToday = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  className={`glass-panel ${isDayToday ? 'today' : ''}`}
                  style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '320px' }}
                >
                  <div style={{ textAlign: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {format(day, 'EEE')}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isDayToday ? 'var(--primary)' : 'var(--text-main)' }}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    {dayEvts.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '1rem' }}>No events</div>
                    ) : (
                      dayEvts.map((evt) => {
                        const isSpecial = hasSpecialStyle(evt);
                        const chipClass = getEventChipClass(evt);
                        const catColor = getCategoryColor(evt.category);

                        return (
                          <div
                            key={evt.id}
                            className={chipClass}
                            style={isSpecial ? { padding: '8px', borderRadius: '8px', whiteSpace: 'normal' } : { 
                              padding: '8px', 
                              borderRadius: '8px', 
                              whiteSpace: 'normal',
                              backgroundColor: catColor,
                              color: '#ffffff'
                            }}
                            onClick={() => onSelectEvent(evt)}
                          >
                            <div>
                              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {evt.isMeet && <Video size={12} />}
                                {evt.isAppSubmitted && <Send size={12} />}
                                {evt.isAppReminder && <Bell size={12} />}
                                {evt.title}
                              </div>
                              <div style={{ fontSize: '0.7rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Clock size={10} />
                                {new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW FOCUS */}
      {viewMode === 'day' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Events for {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {getEventsForDay(currentDate).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem 0' }}>
                No events scheduled for this day. Click "+ Schedule Event" to add one!
              </div>
            ) : (
              getEventsForDay(currentDate).map((evt) => {
                const isSpecial = hasSpecialStyle(evt);
                const chipClass = getEventChipClass(evt);
                const catColor = getCategoryColor(evt.category);

                return (
                  <div
                    key={evt.id}
                    className={`${chipClass} glass-panel`}
                    style={isSpecial ? { padding: '1.25rem', cursor: 'pointer' } : {
                      padding: '1.25rem',
                      borderLeft: `4px solid ${catColor}`,
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelectEvent(evt)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {evt.isMeet && <Video size={18} color="#00ac47" />}
                        {evt.isAppSubmitted && <Send size={18} color="var(--primary)" />}
                        {evt.isAppReminder && <Bell size={18} color="#818cf8" />}
                        {evt.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-glass)' }}>
                        {evt.category || 'General'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      {new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {evt.endDate ? new Date(evt.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                    </div>

                    {evt.notes && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '8px', whiteSpace: 'pre-line' }}>
                        {evt.notes}
                      </div>
                    )}

                    {evt.link && (
                      <a 
                        href={evt.link.startsWith('http') ? evt.link : `https://${evt.link}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="table-link"
                        style={{ display: 'inline-flex', marginTop: '8px', fontSize: '0.8rem' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Join / Launch Link <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            All Scheduled Events Agenda ({filteredEvents.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredEvents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No events found matching your search filters.
              </div>
            ) : (
              [...filteredEvents]
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                .map((evt) => {
                  const isSpecial = hasSpecialStyle(evt);
                  const chipClass = getEventChipClass(evt);
                  const catColor = getCategoryColor(evt.category);

                  return (
                    <div
                      key={evt.id}
                      className={`${chipClass} glass-panel`}
                      style={isSpecial ? { padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' } : {
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderLeft: `4px solid ${catColor}`,
                        cursor: 'pointer'
                      }}
                      onClick={() => onSelectEvent(evt)}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {evt.isMeet && <Video size={16} color="#00ac47" />}
                          {evt.isAppSubmitted && <Send size={16} color="var(--primary)" />}
                          {evt.isAppReminder && <Bell size={16} color="#818cf8" />}
                          {evt.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(evt.startDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {evt.link && (
                          <a 
                            href={evt.link.startsWith('http') ? evt.link : `https://${evt.link}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Link <ExternalLink size={12} />
                          </a>
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: 'var(--bg-glass)' }}>
                          {evt.category || 'General'}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
