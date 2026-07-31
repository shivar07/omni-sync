import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Activity, 
  Briefcase, 
  Plus, 
  CheckSquare, 
  CheckCircle,
  Calendar as CalendarIcon, 
  ExternalLink, 
  Clock, 
  Pause, 
  Play, 
  RotateCcw,
  Lightbulb,
  Video,
  Globe,
  Send
} from 'lucide-react';

export default function ExecutiveDashboard({
  currentUser,
  focusStreak,
  completedFocusSessions,
  activeApplicationsCount,
  todaysSyncs = [],
  priorityDeliverables = [],
  completedTasksCount,
  totalTasksCount,
  completionPercentage,
  weeklyWorkloadData = [],
  maxCount,
  timerMinutes,
  timerSeconds,
  isTimerRunning,
  setIsTimerRunning,
  timerMode,
  setTimerMode,
  setTimerMinutes,
  setTimerSeconds,
  onAddEvent,
  onToggleTaskStatus,
  onNavigate,
  applications = [],
  ideas = [],
  meets = [],
  generalMeets = []
}) {
  let recommendation = "All caught up! No critical deliverables remaining today.";
  if (todaysSyncs.length > 0) {
    const nextSync = todaysSyncs[0];
    recommendation = `Complete preparation for "${nextSync.title}" before its start at ${nextSync.time}.`;
  } else if (priorityDeliverables.length > 0) {
    const nextTask = priorityDeliverables[0];
    const dueDateStr = nextTask.dueDate || nextTask.deadline || 'soon';
    recommendation = `Finish your top task "${nextTask.title}" due ${dueDateStr} to keep streak active.`;
  }

  const activePendingCount = priorityDeliverables.length;
  const totalDeliverablesCount = activePendingCount + todaysSyncs.length;

  // Filter and sort applications applied recently
  const sortedRecentApps = [...applications]
    .sort((a, b) => new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0))
    .slice(0, 3);

  // Filter and sort recent ideas
  const sortedRecentIdeas = [...ideas]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  // Combine and sort future upcoming meetings
  const allMeetsCombined = [
    ...meets.map(m => ({ ...m, meetType: 'google' })),
    ...generalMeets.map(m => ({ ...m, meetType: 'general' }))
  ];
  const sortedUpcomingMeets = allMeetsCombined
    .filter(m => m.startDate && new Date(m.startDate) >= new Date(Date.now() - 30 * 60 * 1000))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  return (
    <div className="dashboard-layout" style={{ width: '100%' }}>
      {/* HERO SECTION - COMPACT */}
      <div className="dashboard-hero" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="dashboard-hero-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.6rem', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '4px', padding: '1px 5px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Sparkles size={8} />
              <span>AI Synthesis</span>
            </span>
            <span className="dashboard-hero-title" style={{ fontSize: '1.05rem', fontWeight: 850, margin: 0 }}>
              Good morning, {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Executive'}.
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {totalDeliverablesCount} priority items remaining.
            </span>
          </div>
          <p className="dashboard-hero-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineStyle: 'none' }}>
            <strong>Next Action:</strong> {recommendation}
          </p>
        </div>
        
        <div className="dashboard-chips-row" style={{ gap: '0.5rem', flexWrap: 'nowrap' }}>
          <span className="dashboard-chip" style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
            <Flame size={10} color="var(--accent-amber)" />
            <span>{focusStreak}d Streak</span>
          </span>
          <span className="dashboard-chip" style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
            <Activity size={10} color="var(--accent-cyan)" />
            <span>{completedFocusSessions} Sprints</span>
          </span>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        alignItems: 'stretch',
        marginTop: '0.25rem'
      }}>
        {/* COLUMN 1: Summary & Tasks */}
        <div className="dashboard-column" style={{ gap: '1.5rem' }}>
          {/* Workload Summary */}
          <div className="dashboard-card">
            <div className="dashboard-card-header" style={{ padding: '0.75rem 1rem' }}>
              <div className="dashboard-card-title" style={{ fontSize: '0.8rem' }}>
                <Activity size={14} color="var(--primary)" />
                <span>Workload summary</span>
              </div>
            </div>
            <div className="dashboard-card-body" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                <span>Tasks Completed</span>
                <span>{completedTasksCount}/{totalTasksCount} ({completionPercentage}%)</span>
              </div>
              <div className="progress-track" style={{ marginTop: '0.4rem' }}>
                <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
              </div>
              
              {/* CSS Bar Chart */}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                Weekly Activity Distribution
              </div>
              <div className="weekly-chart-container" style={{ height: '90px', padding: '0.25rem 0', marginBottom: '0.75rem' }}>
                {weeklyWorkloadData.map((d) => {
                  const heightPercentage = (d.count / maxCount) * 55; // max height is 55px
                  return (
                    <div key={d.day} className="chart-bar-wrapper" title={`${d.count} items on ${d.day}`} style={{ gap: '6px' }}>
                      <div className="chart-bar" style={{ height: `${Math.max(heightPercentage, 4)}px`, width: '14px' }} />
                      <span className="chart-bar-label" style={{ fontSize: '0.65rem' }}>{d.day}</span>
                    </div>
                  );
                })}
              </div>

              <p className="dashboard-summary-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Workload has <strong>{todaysSyncs.length}</strong> events scheduled today and <strong>{activePendingCount}</strong> active tasks.
              </p>
            </div>
          </div>

          {/* Priority Deliverables Queue */}
          <div className="dashboard-card" style={{ flex: 1 }}>
            <div className="dashboard-card-header" style={{ padding: '0.75rem 1rem' }}>
              <div className="dashboard-card-title" style={{ fontSize: '0.8rem' }}>
                <CheckSquare size={14} color="var(--primary)" />
                <span>Priority Tasks</span>
              </div>
              <button className="btn-link" onClick={() => onNavigate('pending')} style={{ fontSize: '0.7rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                View All ({totalTasksCount - completedTasksCount})
              </button>
            </div>
            <div className="dashboard-card-body" style={{ padding: '1rem' }}>
              {priorityDeliverables.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', gap: '0.4rem' }}>
                  <CheckCircle size={24} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Queue is empty</span>
                </div>
              ) : (
                <div className="deliverables-list" style={{ gap: '0.5rem' }}>
                  {priorityDeliverables.map((task) => (
                    <div key={task.id} className="deliverable-item" style={{ padding: '0.6rem 0.8rem' }}>
                      <div className="deliverable-left" style={{ gap: '10px' }}>
                        <div 
                          className={`deliverable-checkbox ${task.status === 'Completed' ? 'checked' : ''}`}
                          onClick={() => onToggleTaskStatus(task.id)}
                          style={{ width: '16px', height: '16px', fontSize: '9px' }}
                        >
                          ✓
                        </div>
                        <span className="deliverable-title" style={{ fontSize: '0.85rem' }}>{task.title}</span>
                      </div>
                      <span 
                        className="deliverable-badge" 
                        style={{
                          padding: '1px 6px',
                          fontSize: '0.6rem',
                          background: task.priority === 'High' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: task.priority === 'High' ? 'var(--accent-rose)' : 'var(--accent-amber)'
                        }}
                      >
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Applications Tracker Widget */}
          <div className="dashboard-card">
            <div className="dashboard-card-header" style={{ padding: '0.75rem 1rem' }}>
              <div className="dashboard-card-title" style={{ fontSize: '0.8rem' }}>
                <Briefcase size={14} color="var(--primary)" />
                <span>Applications Tracker</span>
              </div>
              <button className="btn-link" onClick={() => onNavigate('applications')} style={{ fontSize: '0.7rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                View All ({applications.length})
              </button>
            </div>
            <div className="dashboard-card-body" style={{ padding: '1rem' }}>
              {applications.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', gap: '0.4rem' }}>
                  <Send size={20} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>No applications added yet</span>
                </div>
              ) : (
                <div className="deliverables-list" style={{ gap: '0.5rem' }}>
                  {sortedRecentApps.map((app) => (
                    <div key={app.id} className="deliverable-item" style={{ padding: '0.6rem 0.8rem' }}>
                      <div className="deliverable-left" style={{ gap: '10px' }}>
                        <Send size={12} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <span className="deliverable-title" style={{ fontSize: '0.85rem' }}>{app.title}</span>
                      </div>
                      <span className="deliverable-badge" style={{ padding: '1px 6px', fontSize: '0.6rem', background: 'var(--bg-glass)', color: 'var(--text-muted)' }}>
                        {app.status || 'Submitted'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Syncs & Meetings Timeline */}
        <div className="dashboard-column" style={{ gap: '1.5rem' }}>
          {/* Today's Syncs */}
          <div className="dashboard-card" style={{ flex: 1 }}>
            <div className="dashboard-card-header" style={{ padding: '0.75rem 1rem' }}>
              <div className="dashboard-card-title" style={{ fontSize: '0.8rem' }}>
                <CalendarIcon size={14} color="var(--primary)" />
                <span>Today's Syncs Timeline</span>
              </div>
              <button className="btn-link" onClick={() => onNavigate('calendar')} style={{ fontSize: '0.7rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                Calendar
              </button>
            </div>
            <div className="dashboard-card-body" style={{ padding: '1rem', maxHeight: '350px', overflowY: 'auto' }}>
              {todaysSyncs.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', color: 'var(--text-dim)', gap: '0.5rem' }}>
                  <CalendarIcon size={24} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>No events scheduled today</span>
                </div>
              ) : (
                <div className="timeline-timeline">
                  {todaysSyncs.map((item) => (
                    <div key={item.id} className="timeline-item" style={{ paddingBottom: '0.85rem' }}>
                      <div className="timeline-node" style={{ width: '8px', height: '8px', left: '-19px', top: '7px' }} />
                      <div className="timeline-content-card" style={{ padding: '0.65rem 0.85rem', gap: '10px' }}>
                        <div className="timeline-content-left">
                          <span className="timeline-title" style={{ fontSize: '0.8rem' }}>{item.title}</span>
                          <span className="timeline-time" style={{ fontSize: '0.68rem' }}>{item.time}</span>
                        </div>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="table-link" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                            <span>Join</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Meetings (Future general/google meets) */}
          <div className="dashboard-card" style={{ flex: 1 }}>
            <div className="dashboard-card-header" style={{ padding: '0.75rem 1rem' }}>
              <div className="dashboard-card-title" style={{ fontSize: '0.8rem' }}>
                <CalendarIcon size={14} color="var(--primary)" />
                <span>Upcoming Syncs & Meetings</span>
              </div>
              <button className="btn-link" onClick={() => onNavigate('meets')} style={{ fontSize: '0.7rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                Meetings Hub
              </button>
            </div>
            <div className="dashboard-card-body" style={{ padding: '1rem', maxHeight: '350px', overflowY: 'auto' }}>
              {sortedUpcomingMeets.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', color: 'var(--text-dim)', gap: '0.5rem' }}>
                  <CalendarIcon size={24} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>No upcoming syncs scheduled</span>
                </div>
              ) : (
                <div className="timeline-timeline">
                  {sortedUpcomingMeets.map((item) => (
                    <div key={item.id} className="timeline-item" style={{ paddingBottom: '0.85rem' }}>
                      <div className="timeline-node" style={{ width: '8px', height: '8px', left: '-19px', top: '7px' }} />
                      <div className="timeline-content-card" style={{ padding: '0.65rem 0.85rem', gap: '10px' }}>
                        <div className="timeline-content-left" style={{ flex: 1, overflow: 'hidden' }}>
                          <span className="timeline-title" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                          <span className="timeline-time" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {item.meetType === 'google' ? <Video size={10} /> : <Globe size={10} />}
                            <span>{new Date(item.startDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                          </span>
                        </div>
                        {item.joinUrl && (
                          <a href={item.joinUrl} target="_blank" rel="noopener noreferrer" className="table-link" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                            <span>Join</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: Focus Timer & Ideas */}
        <div className="dashboard-column" style={{ gap: '1.5rem' }}>
          {/* Focus Block Timer */}
          <div className="dashboard-card">
            <div className="dashboard-card-header" style={{ padding: '0.75rem 1rem' }}>
              <div className="dashboard-card-title" style={{ fontSize: '0.8rem' }}>
                <Clock size={14} color="var(--primary)" />
                <span>Focus Block Timer</span>
              </div>
              <span className="timer-mode-badge" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>{timerMode} Mode</span>
            </div>
            <div className="dashboard-card-body" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="focus-timer-container" style={{ gap: '0.75rem', padding: '0.5rem 0' }}>
                <div className="timer-digits" style={{ fontSize: '2.85rem' }}>
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </div>
                
                <div className="timer-controls" style={{ gap: '0.75rem' }}>
                  <button className="timer-btn-primary" onClick={() => setIsTimerRunning(!isTimerRunning)} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', borderRadius: '6px' }}>
                    {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
                  </button>
                  <button className="timer-btn-secondary" onClick={() => {
                    setIsTimerRunning(false);
                    setTimerMinutes(timerMode === 'Focus' ? 25 : 5);
                    setTimerSeconds(0);
                  }} style={{ padding: '0.5rem', borderRadius: '6px' }} title="Reset Timer">
                    <RotateCcw size={14} />
                  </button>
                </div>

                <div className="timer-presets" style={{ gap: '0.4rem' }}>
                  <button className="timer-preset-btn" style={{ padding: '3px 8px', fontSize: '0.65rem' }} onClick={() => {
                    setIsTimerRunning(false);
                    setTimerMode('Focus');
                    setTimerMinutes(25);
                    setTimerSeconds(0);
                  }}>25 Min Sprint</button>
                  <button className="timer-preset-btn" style={{ padding: '3px 8px', fontSize: '0.65rem' }} onClick={() => {
                    setIsTimerRunning(false);
                    setTimerMode('Break');
                    setTimerMinutes(5);
                    setTimerSeconds(0);
                  }}>5 Min Break</button>
                </div>
              </div>
            </div>
          </div>

          {/* Ideas Vault Quick Preview */}
          <div className="dashboard-card" style={{ flex: 1 }}>
            <div className="dashboard-card-header" style={{ padding: '0.75rem 1rem' }}>
              <div className="dashboard-card-title" style={{ fontSize: '0.8rem' }}>
                <Lightbulb size={14} color="var(--primary)" />
                <span>Recent Ideas Vault</span>
              </div>
              <button className="btn-link" onClick={() => onNavigate('ideas')} style={{ fontSize: '0.7rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                View All ({ideas.length})
              </button>
            </div>
            <div className="dashboard-card-body" style={{ padding: '1rem' }}>
              {ideas.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', gap: '0.4rem' }}>
                  <Lightbulb size={20} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>No ideas captured yet</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sortedRecentIdeas.map((item) => (
                    <div key={item.id} className="deliverable-item" style={{ padding: '0.6rem 0.8rem', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                      <div style={{ fontWeight: 750, fontSize: '0.825rem', color: 'var(--text-main)' }}>{item.title}</div>
                      {item.content && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.3' }}>
                          {item.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
