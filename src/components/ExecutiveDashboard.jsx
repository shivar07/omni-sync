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
    <div className="dashboard-layout" style={{ width: '100%', marginTop: '0.5rem' }}>
      <div className="dashboard-card" style={{ padding: '1.5rem', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          {/* LEFT SIDE: BRIEFING & CHECKS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Status Header */}
            <div>
              <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '4px', padding: '2px 6px', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <CheckCircle size={10} />
                <span>Daily Briefing</span>
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Good morning, {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Executive'}.
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '10px' }}>
                <span>🔥 {focusStreak}d Streak</span>
                <span>⚡ {completedFocusSessions} Sprints Completed</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '8px', margin: 0 }}>
                <strong>Next Action:</strong> {recommendation}
              </p>
            </div>

            {/* Priority Tasks */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Priority Tasks ({priorityDeliverables.length})</span>
                {priorityDeliverables.length > 0 && (
                  <button className="btn-link" onClick={() => onNavigate('pending')} style={{ fontSize: '0.7rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    View All
                  </button>
                )}
              </div>
              {priorityDeliverables.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Queue is empty</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {priorityDeliverables.slice(0, 3).map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '6px 8px', background: 'var(--bg-card-hover)', borderRadius: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{item.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Meetings */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Upcoming Meetings ({sortedUpcomingMeets.length})</span>
                {sortedUpcomingMeets.length > 0 && (
                  <button className="btn-link" onClick={() => onNavigate('meets')} style={{ fontSize: '0.7rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    View All
                  </button>
                )}
              </div>
              {sortedUpcomingMeets.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No upcoming meetings scheduled</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {sortedUpcomingMeets.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '6px 8px', background: 'var(--bg-card-hover)', borderRadius: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {new Date(item.startDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: POMODORO TIMER */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-card-hover)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              ⏱️ {timerMode} Mode
            </div>
            
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)', margin: '0.5rem 0' }}>
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', width: '100%', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setIsTimerRunning(!isTimerRunning)} style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setIsTimerRunning(false);
                setTimerMinutes(timerMode === 'Focus' ? 25 : 5);
                setTimerSeconds(0);
              }} style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Reset Timer">
                <RotateCcw size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => {
                setIsTimerRunning(false);
                setTimerMode('Focus');
                setTimerMinutes(25);
                setTimerSeconds(0);
              }}>25 Min Sprint</button>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => {
                setIsTimerRunning(false);
                setTimerMode('Break');
                setTimerMinutes(5);
                setTimerSeconds(0);
              }}>5 Min Break</button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
