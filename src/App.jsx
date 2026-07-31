import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Table, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  ShieldCheck, 
  Zap, 
  Mail, 
  MessageSquare, 
  Sun,
  Moon,
  Settings,
  AlertTriangle,
  FileCheck2,
  Lightbulb,
  CloudCheck,
  Briefcase,
  Send,
  Video,
  Globe,
  Smartphone,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  LogOut,
  UserCheck,
  LayoutDashboard,
  Activity,
  CheckSquare,
  Clock,
  User,
  Keyboard,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Command,
  X,
  Bell,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  getStoredEvents, 
  saveStoredEvents, 
  getStoredCategories, 
  saveStoredCategories, 
  getStoredPendingCategories,
  saveStoredPendingCategories,
  getStoredPendingTasks,
  saveStoredPendingTasks,
  getStoredIdeas,
  saveStoredIdeas,
  getStoredApplications,
  saveStoredApplications,
  getStoredGoogleMeets,
  saveStoredGoogleMeets,
  getStoredGeneralMeets,
  saveStoredGeneralMeets,
  getStoredDailyTodos,
  saveStoredDailyTodos,
  INITIAL_EVENTS, 
  SAMPLE_EVENTS, 
  SAMPLE_PENDING_TASKS,
  SAMPLE_IDEAS,
  SAMPLE_APPLICATIONS,
  SAMPLE_MEETS,
  SAMPLE_GENERAL_MEETS,
  SAMPLE_DAILY_TODOS,
  downloadTxtFile, 
  generateTxtSchedule 
} from './utils/storage';
import { 
  subscribeToUserNode, 
  saveToUserNode, 
  subscribeToFirebaseNode, 
  saveToFirebaseNode,
  pushNotificationToUserFirebase
} from './utils/firebaseStorage';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import Calendar from './components/Calendar';
import TaskSummaryTable from './components/TaskSummaryTable';
import TxtStorageManager from './components/TxtStorageManager';
import SettingsPanel from './components/SettingsPanel';
import PendingWorkTracker from './components/PendingWorkTracker';
import IdeasVault from './components/IdeasVault';
import ApplicationsApplied from './components/ApplicationsApplied';
import UnifiedMeetsWorkspace from './components/UnifiedMeetsWorkspace';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import DailyPlanner from './components/DailyPlanner';
import EventModal from './components/EventModal';
import PendingTaskModal from './components/PendingTaskModal';
import IdeaModal from './components/IdeaModal';
import ApplicationModal from './components/ApplicationModal';
import GoogleMeetModal from './components/GoogleMeetModal';
import GeneralMeetModal from './components/GeneralMeetModal';

export default function App() {
  const triggeredIdsRef = useRef(new Set());
  const itemScheduleTimesRef = useRef(new Map());
  const [events, setEvents] = useState(getStoredEvents);
  const [categories, setCategories] = useState(getStoredCategories);
  const [pendingCategories, setPendingCategories] = useState(getStoredPendingCategories);
  const [pendingTasks, setPendingTasks] = useState(getStoredPendingTasks);
  const [ideas, setIdeas] = useState(getStoredIdeas);
  const [applications, setApplications] = useState(getStoredApplications);
  const [meets, setMeets] = useState(getStoredGoogleMeets);
  const [generalMeets, setGeneralMeets] = useState(getStoredGeneralMeets);
  const [dailyTodos, setDailyTodos] = useState(getStoredDailyTodos);
  
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false);
  const [isPendingLoaded, setIsPendingLoaded] = useState(false);
  const [isMeetsLoaded, setIsMeetsLoaded] = useState(false);
  const [isGeneralMeetsLoaded, setIsGeneralMeetsLoaded] = useState(false);
  const [isApplicationsLoaded, setIsApplicationsLoaded] = useState(false);
  const [isIdeasLoaded, setIsIdeasLoaded] = useState(false);
  const [isDailyTodosLoaded, setIsDailyTodosLoaded] = useState(false);

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('omnisync_active_tab') || 'dashboard';
  });
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('omnisync_active_tab', activeTab);
  }, [activeTab]);

  // Pomodoro Focus Timer States
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('Focus'); // 'Focus' | 'Break'
  const [focusStreak, setFocusStreak] = useState(() => {
    return parseInt(localStorage.getItem('omnisync_focus_streak') || '5', 10);
  });
  const [completedFocusSessions, setCompletedFocusSessions] = useState(() => {
    return parseInt(localStorage.getItem('omnisync_focus_sessions') || '0', 10);
  });



  // Filter sync items scheduled for today
  const todaysSyncs = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const items = [];
    
    meets.forEach(m => {
      if (m.startDate && m.startDate.startsWith(todayStr)) {
        items.push({ ...m, type: 'Google Meet', time: m.startDate.split('T')[1] || 'All Day' });
      }
    });

    generalMeets.forEach(m => {
      if (m.startDate && m.startDate.startsWith(todayStr)) {
        items.push({ ...m, type: 'General Event', time: m.startDate.split('T')[1] || 'All Day' });
      }
    });

    events.forEach(e => {
      if (e.startDate && e.startDate.startsWith(todayStr)) {
        items.push({ ...e, type: 'Calendar Event', time: e.startDate.split('T')[1] || 'All Day' });
      }
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [meets, generalMeets, events]);

  // Filter top 4 incomplete tasks
  const priorityDeliverables = useMemo(() => {
    const highTasks = pendingTasks.filter(t => t.status !== 'Completed');
    return highTasks
      .sort((a, b) => {
        if (a.priority === 'High' && b.priority !== 'High') return -1;
        if (a.priority !== 'High' && b.priority === 'High') return 1;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      })
      .slice(0, 4);
  }, [pendingTasks]);

  // Compute weekly workload counts for chart
  const weeklyWorkloadData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    const now = new Date();
    // Get start of the current week (Sunday)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Count events in range
    [...meets, ...generalMeets, ...events].forEach(item => {
      const dateStr = item.startDate || item.reminderDate;
      if (dateStr) {
        const itemDate = new Date(dateStr);
        if (itemDate >= startOfWeek && itemDate <= endOfWeek) {
          const dayName = days[itemDate.getDay()];
          counts[dayName] = (counts[dayName] || 0) + 1;
        }
      }
    });

    // Count tasks in range
    pendingTasks.forEach(task => {
      const dateStr = task.dueDate || task.deadline;
      if (dateStr) {
        const itemDate = new Date(dateStr);
        if (itemDate >= startOfWeek && itemDate <= endOfWeek) {
          const dayName = days[itemDate.getDay()];
          counts[dayName] = (counts[dayName] || 0) + 1;
        }
      }
    });

    return Object.keys(counts).map(day => ({
      day,
      count: counts[day]
    }));
  }, [meets, generalMeets, events, pendingTasks]);
  
  
  // Theme mode: 'dark' or 'light' (defaults to 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('omnisync_theme') || 'light';
  });

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [defaultModalDate, setDefaultModalDate] = useState(null);

  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [selectedPendingTask, setSelectedPendingTask] = useState(null);

  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [selectedMeet, setSelectedMeet] = useState(null);

  const [isGeneralMeetModalOpen, setIsGeneralMeetModalOpen] = useState(false);
  const [selectedGeneralMeet, setSelectedGeneralMeet] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isBottomProfileOpen, setIsBottomProfileOpen] = useState(false);

  const handleSignInAsTester = () => {
    setCurrentUser({
      uid: 'demo-tester-uid',
      displayName: 'Demo Tester',
      email: 'tester@omnisync.demo',
      photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=tester'
    });
  };
  const [settingsDefaultSection, setSettingsDefaultSection] = useState('pending-tags');
  const [settingsHideSidebar, setSettingsHideSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('omnisync_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('omnisync_sidebar_collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);
  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Reset loading flags synchronously
      setIsCalendarLoaded(false);
      setIsPendingLoaded(false);
      setIsMeetsLoaded(false);
      setIsGeneralMeetsLoaded(false);
      setIsApplicationsLoaded(false);
      setIsIdeasLoaded(false);
      setIsDailyTodosLoaded(false);

      if (user) {
        // Clear all states synchronously before setting user to prevent race condition leakage
        setEvents([]);
        setPendingTasks([]);
        setIdeas([]);
        setApplications([]);
        setMeets([]);
        setGeneralMeets([]);
        setDailyTodos([]);
        triggeredIdsRef.current.clear();
        itemScheduleTimesRef.current.clear();
      } else {
        // Logged out - clear localStorage and states to protect user privacy
        localStorage.removeItem('omnisync_events_v2');
        localStorage.removeItem('omnisync_pending_v1');
        localStorage.removeItem('omnisync_ideas_v1');
        localStorage.removeItem('omnisync_applications_v1');
        localStorage.removeItem('omnisync_meets_v1');
        localStorage.removeItem('omnisync_general_meets_v1');
        localStorage.removeItem('omnisync_daily_todos_v1');

        setEvents([]);
        setPendingTasks([]);
        setIdeas([]);
        setApplications([]);
        setMeets([]);
        setGeneralMeets([]);
        setDailyTodos([]);
        triggeredIdsRef.current.clear();
        itemScheduleTimesRef.current.clear();
        setIsDailyTodosLoaded(true);
      }
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    if (currentUser && currentUser.uid === 'demo-tester-uid') {
      setCurrentUser(null);
      setEvents([]);
      setPendingTasks([]);
      setIdeas([]);
      setApplications([]);
      setMeets([]);
      setGeneralMeets([]);
      setDailyTodos([]);
      triggeredIdsRef.current.clear();
      itemScheduleTimesRef.current.clear();
    } else {
      signOut(auth);
    }
  };

  // --- Scoped Real-time Firebase Database Subscriptions ---
  useEffect(() => {
    if (!currentUser) return;
    
    if (currentUser.uid === 'demo-tester-uid') {
      setEvents(SAMPLE_EVENTS);
      setPendingTasks(SAMPLE_PENDING_TASKS);
      setIdeas(SAMPLE_IDEAS);
      setApplications(SAMPLE_APPLICATIONS);
      setMeets(SAMPLE_MEETS);
      setGeneralMeets(SAMPLE_GENERAL_MEETS);
      setDailyTodos(SAMPLE_DAILY_TODOS);
      
      setIsCalendarLoaded(true);
      setIsPendingLoaded(true);
      setIsMeetsLoaded(true);
      setIsGeneralMeetsLoaded(true);
      setIsApplicationsLoaded(true);
      setIsIdeasLoaded(true);
      setIsDailyTodosLoaded(true);
      setIsFirebaseConnected(false);
      return;
    }

    let isSubscribed = true;
    const uid = currentUser.uid;
    setIsFirebaseConnected(true);

    // Calendar Node Listener
    const unsubCalendar = subscribeToUserNode(uid, 'calendar', (fbEvents) => {
      if (!isSubscribed) return;
      if (fbEvents && fbEvents.length >= 0) {
        setEvents(fbEvents);
        saveStoredEvents(fbEvents);
        setIsCalendarLoaded(true);
      }
    });

    // Pending Tasks Node Listener
    const unsubPending = subscribeToUserNode(uid, 'pending', (fbPending) => {
      if (!isSubscribed) return;
      if (fbPending && fbPending.length >= 0) {
        setPendingTasks(fbPending);
        saveStoredPendingTasks(fbPending);
        setIsPendingLoaded(true);
      }
    });

    // Ideas Node Listener
    const unsubIdeas = subscribeToUserNode(uid, 'ideas', (fbIdeas) => {
      if (!isSubscribed) return;
      if (fbIdeas && fbIdeas.length >= 0) {
        setIdeas(fbIdeas);
        saveStoredIdeas(fbIdeas);
        setIsIdeasLoaded(true);
      }
    });

    // Applications Node Listener
    const unsubApplications = subscribeToUserNode(uid, 'applications', (fbApps) => {
      if (!isSubscribed) return;
      if (fbApps && fbApps.length >= 0) {
        setApplications(fbApps);
        saveStoredApplications(fbApps);
        setIsApplicationsLoaded(true);
      }
    });

    // Google Meets Node Listener
    const unsubMeets = subscribeToUserNode(uid, 'meets', (fbMeets) => {
      if (!isSubscribed) return;
      if (fbMeets && fbMeets.length >= 0) {
        setMeets(fbMeets);
        saveStoredGoogleMeets(fbMeets);
        setIsMeetsLoaded(true);
      }
    });

    // General Meets Node Listener
    const unsubGeneralMeets = subscribeToUserNode(uid, 'generalMeets', (fbGMeets) => {
      if (!isSubscribed) return;
      if (fbGMeets && fbGMeets.length >= 0) {
        setGeneralMeets(fbGMeets);
        saveStoredGeneralMeets(fbGMeets);
        setIsGeneralMeetsLoaded(true);
      }
    });

    // Categories Node Listener
    const unsubCategories = subscribeToUserNode(uid, 'categories', (fbCats) => {
      if (!isSubscribed) return;
      if (fbCats && fbCats.length > 0) {
        setCategories(fbCats);
        saveStoredCategories(fbCats);
      }
    });

    // Pending Categories Node Listener
    const unsubPendingCats = subscribeToUserNode(uid, 'pendingCategories', (fbPCats) => {
      if (!isSubscribed) return;
      if (fbPCats && fbPCats.length > 0) {
        setPendingCategories(fbPCats);
        saveStoredPendingCategories(fbPCats);
      }
    });

    // Daily Todos Node Listener
    const unsubDailyTodos = subscribeToUserNode(uid, 'dailyTodos', (fbDailyTodos) => {
      if (!isSubscribed) return;
      if (fbDailyTodos && fbDailyTodos.length >= 0) {
        setDailyTodos(fbDailyTodos);
        saveStoredDailyTodos(fbDailyTodos);
        setIsDailyTodosLoaded(true);
      }
    });

    return () => {
      isSubscribed = false;
      unsubCalendar();
      unsubPending();
      unsubIdeas();
      unsubApplications();
      unsubMeets();
      unsubGeneralMeets();
      unsubCategories();
      unsubPendingCats();
      unsubDailyTodos();
    };
  }, [currentUser]);

  // Real-time local background scanner for due reminders across ALL workspace modules
  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    const parseScheduledDate = (dateStr) => {
      if (!dateStr) return null;
      if (typeof dateStr !== 'string') return new Date(dateStr);
      // If string already contains offset (+ or Z) or full ISO
      if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.length > 19)) {
        return new Date(dateStr);
      }
      return new Date(`${dateStr}+05:30`);
    };

    const checkReminders = async () => {
      // Disallow scanning on stale local storage until first Firebase sync has completed
      if (!isCalendarLoaded || !isPendingLoaded || !isMeetsLoaded || !isGeneralMeetsLoaded || !isApplicationsLoaded) {
        return;
      }

      const now = new Date();

      // Detect if scheduled time was actually edited/changed for any item
      [...applications, ...meets, ...generalMeets, ...events, ...pendingTasks].forEach(item => {
        if (item && item.id) {
          const scheduledTimeStr = item.startDate || item.reminderDate || item.dueDate || item.deadline;
          const previousScheduledTime = itemScheduleTimesRef.current.get(item.id);
          if (previousScheduledTime && previousScheduledTime !== scheduledTimeStr) {
            // Scheduled time was edited! Clear triggered lock for this item
            triggeredIdsRef.current.delete(item.id);
          }
          if (scheduledTimeStr) {
            itemScheduleTimesRef.current.set(item.id, scheduledTimeStr);
          }
        }
      });

      // 1. Applications Reminder Scanner
      applications.forEach(async (app, idx) => {
        if (app.reminderDate && !app.reminderTriggered && !triggeredIdsRef.current.has(app.id)) {
          const remTime = parseScheduledDate(app.reminderDate);
          if (!remTime || isNaN(remTime.getTime())) return;
          const diffMs = now - remTime;
          if (diffMs >= 0) {
            triggeredIdsRef.current.add(app.id); // Deduplicate synchronously!
            if (diffMs < 5 * 60 * 1000) {
              console.log('[OmniSync Reminder] Application due:', app.title);
              await pushNotificationToUserFirebase(uid, {
                title: `OmniSync Application Reminder`,
                message: `Your reminder for "${app.title}" is due now!`,
                type: 'Application',
                link: app.link || '',
                notes: app.notes || ''
              });
            }
            const updated = [...applications];
            updated[idx] = { ...app, reminderTriggered: true };
            saveStoredApplications(updated, uid);
            syncToFirebase('applications', updated);
          }
        }
      });

      // 2. Google Meets Reminder Scanner
      meets.forEach(async (meet, idx) => {
        if (meet.startDate && !meet.reminderTriggered && !triggeredIdsRef.current.has(meet.id)) {
          const meetTime = parseScheduledDate(meet.startDate);
          if (!meetTime || isNaN(meetTime.getTime())) return;
          const diffMs = now - meetTime;
          if (diffMs >= 0) {
            triggeredIdsRef.current.add(meet.id); // Deduplicate synchronously!
            if (diffMs < 5 * 60 * 1000) {
              console.log('[OmniSync Reminder] Google Meet due:', meet.title);
              await pushNotificationToUserFirebase(uid, {
                title: `Google Meet Starting: ${meet.title}`,
                message: `Your meeting "${meet.title}" is scheduled now!`,
                type: 'Google Meet',
                link: meet.link || '',
                notes: meet.notes || ''
              });
            }
            const updated = [...meets];
            updated[idx] = { ...meet, reminderTriggered: true };
            saveStoredGoogleMeets(updated, uid);
            syncToFirebase('meets', updated);
          }
        }
      });

      // 3. General Meets Reminder Scanner
      generalMeets.forEach(async (meet, idx) => {
        if (meet.startDate && !meet.reminderTriggered && !triggeredIdsRef.current.has(meet.id)) {
          const meetTime = parseScheduledDate(meet.startDate);
          if (!meetTime || isNaN(meetTime.getTime())) return;
          const diffMs = now - meetTime;
          if (diffMs >= 0) {
            triggeredIdsRef.current.add(meet.id); // Deduplicate synchronously!
            if (diffMs < 5 * 60 * 1000) {
              console.log('[OmniSync Reminder] General Event due:', meet.title);
              await pushNotificationToUserFirebase(uid, {
                title: `Event Starting: ${meet.title}`,
                message: `Your event "${meet.title}" is scheduled now!`,
                type: 'General Meet',
                link: meet.link || '',
                notes: meet.notes || ''
              });
            }
            const updated = [...generalMeets];
            updated[idx] = { ...meet, reminderTriggered: true };
            saveStoredGeneralMeets(updated, uid);
            syncToFirebase('generalMeets', updated);
          }
        }
      });

      // 4. Calendar Events Reminder Scanner
      events.forEach(async (evt, idx) => {
        if (evt.startDate && !evt.reminderTriggered && !triggeredIdsRef.current.has(evt.id)) {
          const evtTime = parseScheduledDate(evt.startDate);
          if (!evtTime || isNaN(evtTime.getTime())) return;
          const diffMs = now - evtTime;
          if (diffMs >= 0) {
            triggeredIdsRef.current.add(evt.id); // Deduplicate synchronously!
            if (diffMs < 5 * 60 * 1000) {
              console.log('[OmniSync Reminder] Calendar Event due:', evt.title);
              await pushNotificationToUserFirebase(uid, {
                title: `Calendar Event: ${evt.title}`,
                message: `Event "${evt.title}" is starting now!`,
                type: 'Calendar Event',
                link: evt.link || '',
                notes: evt.notes || ''
              });
            }
            const updated = [...events];
            updated[idx] = { ...evt, reminderTriggered: true };
            saveStoredEvents(updated, uid);
            syncToFirebase('calendar', updated);
          }
        }
      });

      // 5. Pending Work Tasks Reminder Scanner
      pendingTasks.forEach(async (task, idx) => {
        const taskDate = task.dueDate || task.deadline;
        if (taskDate && !task.reminderTriggered && task.status !== 'Completed' && !triggeredIdsRef.current.has(task.id)) {
          const taskTime = parseScheduledDate(taskDate.includes('T') ? taskDate : `${taskDate}T09:00`);
          if (!taskTime || isNaN(taskTime.getTime())) return;
          const diffMs = now - taskTime;
          if (diffMs >= 0) {
            triggeredIdsRef.current.add(task.id); // Deduplicate synchronously!
            if (diffMs < 5 * 60 * 1000) {
              console.log('[OmniSync Reminder] Pending Task due:', task.title);
              await pushNotificationToUserFirebase(uid, {
                title: `Pending Task Due: ${task.title}`,
                message: `Don't forget to complete "${task.title}"!`,
                type: 'Pending Task',
                link: task.link || '',
                notes: task.notes || ''
              });
            }
            const updated = [...pendingTasks];
            updated[idx] = { ...task, reminderTriggered: true };
            saveStoredPendingTasks(updated, uid);
            syncToFirebase('pending', updated);
          }
        }
      });
    };

    // Execute check immediately when data arrives or changes
    checkReminders();

    // 10-second polling interval matching Android companion app cycle
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [currentUser, applications, meets, generalMeets, events, pendingTasks]);

  // Sync theme attribute to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('omnisync_theme', theme);
  }, [theme]);

  // Close profile dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isProfileDropdownOpen) {
        const container = document.getElementById('profile-menu-container');
        if (container && !container.contains(e.target)) {
          setIsProfileDropdownOpen(false);
        }
      }
      if (isBottomProfileOpen) {
        const bottomContainer = document.getElementById('bottom-profile-container');
        if (bottomContainer && !bottomContainer.contains(e.target)) {
          setIsBottomProfileOpen(false);
        }
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isProfileDropdownOpen, isBottomProfileOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Pomodoro Focus Timer Side Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds((prev) => prev - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes((prev) => prev - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished!
          clearInterval(interval);
          setIsTimerRunning(false);
          playChime();
          
          if (timerMode === 'Focus') {
            const newStreak = focusStreak + 1;
            const newSessions = completedFocusSessions + 1;
            setFocusStreak(newStreak);
            setCompletedFocusSessions(newSessions);
            localStorage.setItem('omnisync_focus_streak', newStreak.toString());
            localStorage.setItem('omnisync_focus_sessions', newSessions.toString());
            
            triggerFocusEndNotification('Focus');
            
            // Switch to Break mode
            setTimerMode('Break');
            setTimerMinutes(5);
            setTimerSeconds(0);
          } else {
            triggerFocusEndNotification('Break');
            // Switch back to Focus mode
            setTimerMode('Focus');
            setTimerMinutes(25);
            setTimerSeconds(0);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds, timerMode]);



  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      playNote(880, audioCtx.currentTime, 0.4);
      playNote(1320, audioCtx.currentTime + 0.15, 0.6);
    } catch (e) {
      console.warn('Web Audio chime failed:', e);
    }
  };

  const triggerFocusEndNotification = async (mode) => {
    if (currentUser) {
      try {
        await pushNotificationToUserFirebase(currentUser.uid, {
          title: `OmniSync Focus Timer`,
          message: `${mode} Block Completed!`,
          type: 'Focus Timer',
          link: '',
          notes: ''
        });
      } catch (e) {
        console.error('Focus notification error:', e);
      }
    }
  };

  // Sync pending tasks, Google Meets, and General Meets into merged calendar events!
  const mergedCalendarEvents = useMemo(() => {
    const syncedFromPending = pendingTasks
      .filter((t) => t.syncToCalendar && t.deadline && t.status !== 'Completed')
      .map((t) => ({
        id: 'synced-' + t.id,
        title: `[PENDING] ${t.title}`,
        category: t.category,
        startDate: t.deadline,
        endDate: t.deadline,
        link: t.link,
        notes: `Priority: ${t.priority} | ${t.notes || ''}`,
        reminder: '1 day before'
      }));

    const syncedFromMeets = meets.map((m) => ({
      id: 'meet-evt-' + m.id,
      title: m.title,
      category: 'Google Meet (Personal)',
      startDate: m.startDate,
      endDate: m.endDate || m.startDate,
      link: m.link,
      notes: m.notes,
      isMeet: true,
      isImportantMeet: m.isImportant !== false
    }));

    const syncedFromGeneralMeets = generalMeets.map((gm) => ({
      id: 'gmeet-evt-' + gm.id,
      title: `[${gm.platform || 'Meet'}] ${gm.title}`,
      category: 'Webinar',
      startDate: gm.startDate,
      endDate: gm.endDate || gm.startDate,
      link: gm.link,
      notes: gm.notes
    }));

    const syncedFromApplications = [];
    applications.forEach((app) => {
      // 1. Submission / Applied Date
      if (app.appliedDate) {
        syncedFromApplications.push({
          id: 'app-submitted-' + app.id,
          title: `📤 Applied: ${app.title}`,
          category: 'Application Submitted',
          startDate: app.appliedDate,
          endDate: app.appliedDate,
          link: app.link,
          notes: app.notes,
          isAppSubmitted: true
        });
      }
      // 2. Follow-up Reminder Date
      if (app.reminderDate) {
        syncedFromApplications.push({
          id: 'app-reminder-' + app.id,
          title: `🔔 Follow Up: ${app.title}`,
          category: 'Application Follow-Up',
          startDate: app.reminderDate,
          endDate: app.reminderDate,
          link: app.link,
          notes: app.notes,
          isAppReminder: true
        });
      }
    });

    return [...syncedFromApplications, ...syncedFromGeneralMeets, ...syncedFromMeets, ...syncedFromPending, ...events];
  }, [events, pendingTasks, meets, generalMeets, applications]);

  // Scoped Firebase saver helper
  const syncToFirebase = (nodeName, data) => {
    if (!currentUser) return;
    if (currentUser.uid === 'demo-tester-uid') return;
    saveToUserNode(currentUser.uid, nodeName, data);
  };

  // Handlers for Calendar Events
  const handleSaveEvent = (savedEvent) => {
    const updated = events.some((e) => e.id === savedEvent.id)
      ? events.map((e) => (e.id === savedEvent.id ? savedEvent : e))
      : [savedEvent, ...events];

    setEvents(updated);
    saveStoredEvents(updated);
    syncToFirebase('calendar', updated);
  };

  const handleDeleteEvent = (eventId) => {
    const updated = events.filter((e) => e.id !== eventId);
    setEvents(updated);
    saveStoredEvents(updated);
    syncToFirebase('calendar', updated);
  };

  // Handlers for Pending Tasks
  const handleSavePendingTask = (savedTask) => {
    const updated = pendingTasks.some((t) => t.id === savedTask.id)
      ? pendingTasks.map((t) => (t.id === savedTask.id ? savedTask : t))
      : [savedTask, ...pendingTasks];

    setPendingTasks(updated);
    saveStoredPendingTasks(updated);
    syncToFirebase('pending', updated);
  };

  const handleDeletePendingTask = (taskId) => {
    const updated = pendingTasks.filter((t) => t.id !== taskId);
    setPendingTasks(updated);
    saveStoredPendingTasks(updated);
    syncToFirebase('pending', updated);
  };

  const handleTogglePendingStatus = (taskId) => {
    const updated = pendingTasks.map((t) =>
      t.id === taskId
        ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
        : t
    );

    setPendingTasks(updated);
    saveStoredPendingTasks(updated);
    syncToFirebase('pending', updated);
  };

  // Handlers for Ideas
  const handleSaveIdea = (savedIdea) => {
    const updated = ideas.some((i) => i.id === savedIdea.id)
      ? ideas.map((i) => (i.id === savedIdea.id ? savedIdea : i))
      : [savedIdea, ...ideas];

    setIdeas(updated);
    saveStoredIdeas(updated);
    syncToFirebase('ideas', updated);
  };

  const handleDeleteIdea = (ideaId) => {
    const updated = ideas.filter((i) => i.id !== ideaId);
    setIdeas(updated);
    saveStoredIdeas(updated);
    syncToFirebase('ideas', updated);
  };

  // Handlers for Applications Applied
  const handleSaveApplication = (savedApp) => {
    const updated = applications.some((a) => a.id === savedApp.id)
      ? applications.map((a) => (a.id === savedApp.id ? savedApp : a))
      : [savedApp, ...applications];

    setApplications(updated);
    saveStoredApplications(updated);
    syncToFirebase('applications', updated);
  };

  const handleDeleteApplication = (appId) => {
    const updated = applications.filter((a) => a.id !== appId);
    setApplications(updated);
    saveStoredApplications(updated);
    syncToFirebase('applications', updated);
  };

  const handleUpdateApplicationStatus = (appId, newStatus) => {
    const updated = applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a));
    setApplications(updated);
    saveStoredApplications(updated);
    syncToFirebase('applications', updated);
  };

  // Handlers for Google Meets
  const handleSaveMeet = (savedMeet) => {
    const updated = meets.some((m) => m.id === savedMeet.id)
      ? meets.map((m) => (m.id === savedMeet.id ? savedMeet : m))
      : [savedMeet, ...meets];

    setMeets(updated);
    saveStoredGoogleMeets(updated);
    syncToFirebase('meets', updated);
  };

  const handleDeleteMeet = (meetId) => {
    const updated = meets.filter((m) => m.id !== meetId);
    setMeets(updated);
    saveStoredGoogleMeets(updated);
    syncToFirebase('meets', updated);
  };

  // Handlers for General Meets
  const handleSaveGeneralMeet = (savedGMeet) => {
    const updated = generalMeets.some((gm) => gm.id === savedGMeet.id)
      ? generalMeets.map((gm) => (gm.id === savedGMeet.id ? savedGMeet : gm))
      : [savedGMeet, ...generalMeets];

    setGeneralMeets(updated);
    saveStoredGeneralMeets(updated);
    syncToFirebase('generalMeets', updated);
  };

  const handleDeleteGeneralMeet = (gmeetId) => {
    const updated = generalMeets.filter((gm) => gm.id !== gmeetId);
    setGeneralMeets(updated);
    saveStoredGeneralMeets(updated);
    syncToFirebase('generalMeets', updated);
  };

  // Handlers for Categories
  const handleSaveCategories = (updatedCategories) => {
    setCategories(updatedCategories);
    saveStoredCategories(updatedCategories);
    syncToFirebase('categories', updatedCategories);
  };

  const handleSavePendingCategories = (updatedCategories) => {
    setPendingCategories(updatedCategories);
    saveStoredPendingCategories(updatedCategories);
    syncToFirebase('pendingCategories', updatedCategories);
  };

  const handleOpenAddEventModal = (date = null) => {
    setSelectedEvent(null);
    setDefaultModalDate(date);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEventModal = (event) => {
    setSelectedEvent(event);
    setDefaultModalDate(null);
    setIsEventModalOpen(true);
  };

  const handleOpenAddPendingModal = () => {
    setSelectedPendingTask(null);
    setIsPendingModalOpen(true);
  };

  const handleOpenEditPendingModal = (task) => {
    setSelectedPendingTask(task);
    setIsPendingModalOpen(true);
  };

  const handleOpenAddIdeaModal = () => {
    setSelectedIdea(null);
    setIsIdeaModalOpen(true);
  };

  const handleOpenEditIdeaModal = (idea) => {
    setSelectedIdea(idea);
    setIsIdeaModalOpen(true);
  };

  const handleOpenAddApplicationModal = () => {
    setSelectedApplication(null);
    setIsApplicationModalOpen(true);
  };

  const handleOpenEditApplicationModal = (app) => {
    setSelectedApplication(app);
    setIsApplicationModalOpen(true);
  };

  const handleOpenAddMeetModal = () => {
    setSelectedMeet(null);
    setIsMeetModalOpen(true);
  };

  const handleOpenEditMeetModal = (meet) => {
    setSelectedMeet(meet);
    setIsMeetModalOpen(true);
  };

  const handleOpenAddGeneralMeetModal = () => {
    setSelectedGeneralMeet(null);
    setIsGeneralMeetModalOpen(true);
  };

  const handleOpenEditGeneralMeetModal = (gmeet) => {
    setSelectedGeneralMeet(gmeet);
    setIsGeneralMeetModalOpen(true);
  };

  const handleImportEvents = (newEvents) => {
    const existingIds = new Set(events.map(e => e.id));
    const filteredNew = newEvents.filter(e => !existingIds.has(e.id));
    const updated = [...filteredNew, ...events];
    setEvents(updated);
    saveStoredEvents(updated);
    syncToFirebase('calendar', updated);
  };

  const handleResetDefaults = () => {
    setEvents(INITIAL_EVENTS);
    setPendingTasks([]);
    setIdeas([]);
    setApplications([]);
    setMeets([]);
    setGeneralMeets([]);
    setDailyTodos([]);
    syncToFirebase('calendar', []);
    syncToFirebase('pending', []);
    syncToFirebase('ideas', []);
    syncToFirebase('applications', []);
    syncToFirebase('meets', []);
    syncToFirebase('generalMeets', []);
    syncToFirebase('dailyTodos', []);
  };

  const handleLoadSampleEvents = () => {
    setEvents(SAMPLE_EVENTS);
    setPendingTasks(SAMPLE_PENDING_TASKS);
    setIdeas(SAMPLE_IDEAS);
    setApplications(SAMPLE_APPLICATIONS);
    setMeets(SAMPLE_MEETS);
    setGeneralMeets(SAMPLE_GENERAL_MEETS);
    const initialSampleTodos = [
      {
        id: 'todo-sample-1',
        title: 'Welcome to Daily Planner! Add your first task below',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        priority: 'Medium',
        category: 'Personal',
        createdAt: new Date().toISOString()
      }
    ];
    setDailyTodos(initialSampleTodos);
    syncToFirebase('calendar', SAMPLE_EVENTS);
    syncToFirebase('pending', SAMPLE_PENDING_TASKS);
    syncToFirebase('ideas', SAMPLE_IDEAS);
    syncToFirebase('applications', SAMPLE_APPLICATIONS);
    syncToFirebase('meets', SAMPLE_MEETS);
    syncToFirebase('generalMeets', SAMPLE_GENERAL_MEETS);
    syncToFirebase('dailyTodos', initialSampleTodos);
  };

  const handleQuickDownloadTxt = () => {
    const txt = generateTxtSchedule(events, pendingTasks, ideas, applications, meets, generalMeets);
    downloadTxtFile(txt);
  };

  const activePendingCount = pendingTasks.filter(t => t.status !== 'Completed').length;

  if (authLoading) {
    return (
      <div className="app-container" style={{ pointerEvents: 'none' }}>
        {/* SIDEBAR SKELETON */}
        <aside className="sidebar">
          <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
            <div className="logo-icon skeleton-shimmer" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
            <div className="skeleton-shimmer" style={{ width: '80px', height: '16px', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="skeleton-shimmer" style={{ width: '100%', height: '38px', borderRadius: '8px' }} />
            ))}
          </div>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '48px', borderRadius: '8px', marginTop: 'auto' }} />
        </aside>

        {/* CONTENT WRAPPER SKELETON */}
        <div className="main-content">
          {/* HEADER SKELETON */}
          <header className="header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="skeleton-shimmer" style={{ width: '160px', height: '22px', borderRadius: '4px' }} />
              <div className="skeleton-shimmer" style={{ width: '90px', height: '18px', borderRadius: '999px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="skeleton-shimmer" style={{ width: '100px', height: '32px', borderRadius: '8px' }} />
              <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
              <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            </div>
          </header>

          {/* DASHBOARD GRID CONTENT SKELETON */}
          <div className="content-body" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* HERO BANNER SKELETON */}
            <div className="skeleton-shimmer" style={{ width: '100%', height: '140px', borderRadius: '12px' }} />

            {/* 3-COLUMN CONTENT GRID SKELETON */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
              alignItems: 'stretch',
              marginTop: '0.5rem'
            }}>
              {/* COL 1: Summary & Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="skeleton-shimmer" style={{ width: '100%', height: '190px', borderRadius: '12px' }} />
                <div className="skeleton-shimmer" style={{ width: '100%', height: '190px', borderRadius: '12px' }} />
              </div>

              {/* COL 2: Timeline */}
              <div className="skeleton-shimmer" style={{ width: '100%', minHeight: '390px', borderRadius: '12px' }} />

              {/* COL 3: Focus Timer */}
              <div className="skeleton-shimmer" style={{ width: '100%', minHeight: '390px', borderRadius: '12px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark' ? 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)' : 'radial-gradient(circle at center, #f8fafc 0%, #cbd5e1 100%)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-main)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Animated Background Orbs */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          top: '-10%',
          left: '-10%'
        }} />
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 70%)',
          bottom: '-15%',
          right: '-10%'
        }} />

        <div className="glass-panel" style={{
          width: '420px',
          padding: '2.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
            }}>
              <CalendarIcon size={32} color="white" />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 950,
              letterSpacing: '-0.02em',
              background: theme === 'dark' ? 'linear-gradient(135deg, #ffffff 0%, #9ca3af 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: '0.75rem'
            }}>OmniSync</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Real-time Task & Notification Bridge
            </p>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Access your unified workspace, build custom application alerts, and sync notifications instantly to your phone.
          </p>

          <button 
            onClick={async () => {
              try {
                await signInWithPopup(auth, googleProvider);
              } catch (e) {
                console.error(e);
              }
            }}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: '#ffffff',
              color: '#1f2937',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.25s ease'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3.02-3.1 3.02l4.8 3.73c2.8-2.58 4.41-6.38 4.41-10.6z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.8-3.73c-1.33.89-3.04 1.43-4.8 1.43-3.69 0-6.8-2.49-7.92-5.83H1.43v3.9C3.42 20.84 7.42 24 12 24z"/>
              <path fill="#FBBC05" d="M4.08 12.96A7.16 7.16 0 0 1 3.86 12a7.16 7.16 0 0 1 .22-.96v-3.9H1.43c-.76 1.5-1.18 3.19-1.18 4.96s.42 3.46 1.18 4.96l2.65-3.1z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.42 0 3.42 3.16 1.43 7.2l2.65 3.9c1.12-3.34 4.23-5.83 7.92-5.83z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button 
            onClick={handleSignInAsTester}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.25s ease',
              marginTop: '-0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--bg-glass)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <UserCheck size={18} color="var(--primary)" />
            <span>Sign in as Tester</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" data-theme={theme}>
      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="logo-container">
          <div className="logo-details">
            <div className="logo-text">OmniSync</div>
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 'auto',
              transition: 'all 0.2s ease',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)'
            }}
            className="sidebar-toggle-btn"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="nav-menu">
          <div className="sidebar-section-title" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', padding: '0 0.5rem 0.4rem 0.5rem', letterSpacing: '0.05em' }}>
            Active Workspaces
          </div>

          {/* Executive Dashboard */}
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Executive Dashboard</span>
          </button>

          {/* Calendar */}
          <button 
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <CalendarIcon size={18} />
            <span>Interactive Calendar</span>
            <span className="badge-upcoming">{mergedCalendarEvents.length}</span>
          </button>

          {/* Daily Planner */}
          <button 
            className={`nav-item ${activeTab === 'daily-todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily-todos')}
          >
            <CheckSquare size={18} />
            <span>Daily Planner</span>
            {dailyTodos.filter(t => t.date === new Date().toISOString().split('T')[0] && t.status !== 'Completed').length > 0 && (
              <span className="badge-upcoming" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', fontWeight: 800 }}>
                {dailyTodos.filter(t => t.date === new Date().toISOString().split('T')[0] && t.status !== 'Completed').length}
              </span>
            )}
          </button>

          {/* Meetings & Events Hub */}
          <button 
            className={`nav-item ${activeTab === 'meets' ? 'active' : ''}`}
            onClick={() => setActiveTab('meets')}
          >
            <Video size={18} />
            <span>Meetings & Events Hub</span>
            <span className="badge-upcoming" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', fontWeight: 800 }}>
              {meets.length + generalMeets.length}
            </span>
          </button>

          {/* Applications Applied Tracker */}
          <button 
            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <Send size={18} />
            <span>Applications Applied</span>
            <span className="badge-upcoming">{applications.length}</span>
          </button>

          {/* Ideas Vault */}
          <button 
            className={`nav-item ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideas')}
          >
            <Lightbulb size={18} />
            <span>Ideas Vault</span>
            <span className="badge-upcoming">{ideas.length}</span>
          </button>

          {/* Pending Work Vault */}
          <button 
            className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <FileCheck2 size={18} />
            <span>Pending Work Vault</span>
            {activePendingCount > 0 && (
              <span className="badge-upcoming" style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--accent-rose)', fontWeight: 800 }}>
                {activePendingCount}
              </span>
            )}
          </button>

          <div className="sidebar-section-title" style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', padding: '0 0.5rem 0.4rem 0.5rem', letterSpacing: '0.05em' }}>
            Expansion Roadmap
          </div>

          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              setSettingsDefaultSection('notification-portal');
              setSettingsHideSidebar(true);
            }}
            style={{ cursor: 'pointer', background: 'transparent', width: '100%', border: 'none', textAlign: 'left' }}
          >
            <Smartphone size={18} />
            <span>Mobile Push Alerts</span>
            <span className="badge-live" style={{ background: 'var(--accent-emerald)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.65rem', marginLeft: 'auto' }}>ACTIVE</span>
          </button>

          <div className="nav-item" style={{ opacity: 0.55, cursor: 'not-allowed' }} title="Coming in next backend update">
            <Mail size={18} />
            <span>Email Auto-Ingester</span>
            <span className="badge-upcoming">Soon</span>
          </div>

          <div className="nav-item" style={{ opacity: 0.55, cursor: 'not-allowed' }} title="Coming in next backend update">
            <MessageSquare size={18} />
            <span>WhatsApp Event Sync</span>
            <span className="badge-upcoming">Soon</span>
          </div>

          <div className="nav-item" style={{ opacity: 0.55, cursor: 'not-allowed' }} title="Coming in next backend update">
            <ShieldCheck size={18} />
            <span>Protected Reminders</span>
            <span className="badge-upcoming">Soon</span>
          </div>
        </nav>

        {/* Sidebar Footer User Card */}
        {currentUser && (
          <div 
            id="bottom-profile-container" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              marginTop: 'auto',
              marginBottom: '10px',
              position: 'relative'
            }}
          >
            {/* Clickable user details */}
            <div 
              onClick={() => setIsBottomProfileOpen(!isBottomProfileOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}
              title="Profile Options"
            >
              <img 
                src={currentUser.photoURL || 'https://lh3.googleusercontent.com/a/default-user=s96-c'} 
                alt="User profile"
                referrerPolicy="no-referrer"
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--primary)' }}
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.displayName || 'User')}`;
                }}
              />
              <div className="sidebar-footer-user-details" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.displayName || 'OmniSync User'}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.email}
                </span>
              </div>
            </div>
            
            {/* Quick settings button inside card */}
            <button 
              onClick={() => {
                setActiveTab('settings');
                setSettingsDefaultSection('pending-tags');
                setSettingsHideSidebar(false);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Platform Settings"
            >
              <Settings size={14} />
            </button>

            {/* Bottom floating settings popup */}
            {isBottomProfileOpen && (
              <div className="glass-panel" style={{
                position: 'absolute',
                bottom: '50px',
                left: '0',
                width: '240px',
                padding: '0.75rem',
                zIndex: 1000,
                background: theme === 'dark' ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderRadius: '8px',
                animation: 'fadeIn 0.15s ease-out'
              }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsBottomProfileOpen(false);
                    setActiveTab('settings');
                    setSettingsDefaultSection('pending-tags');
                    setSettingsHideSidebar(false);
                  }}
                  style={{ width: '100%', fontSize: '0.8rem', padding: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)' }}
                >
                  <Settings size={14} />
                  <span>Platform Settings</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsBottomProfileOpen(false);
                    handleSignOut();
                  }}
                  style={{ width: '100%', fontSize: '0.8rem', padding: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="main-wrapper">
        {/* TOP HEADER */}
        <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
          {/* Today's Title Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>Today's Workspace Command</span>
            <span style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: '999px', padding: '2px 10px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </span>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>


            {/* Quick Capture Button */}
            <button 
              className="btn btn-primary" 
              onClick={() => handleOpenAddEventModal()}
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Plus size={14} />
              <span>Quick Capture</span>
            </button>

            {/* Theme Switcher Button */}
            <button className="theme-toggle-btn" onClick={toggleTheme} style={{ height: '32px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
              {theme === 'dark' ? <Sun size={14} color="var(--accent-amber)" /> : <Moon size={14} color="var(--primary)" />}
            </button>

            {currentUser && (
              <div id="profile-menu-container" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)',
                    transition: 'transform 0.2s ease'
                  }}
                  title={currentUser.displayName || 'Profile Menu'}
                >
                  <img 
                    src={currentUser.photoURL || 'https://lh3.googleusercontent.com/a/default-user=s96-c'} 
                    alt={currentUser.displayName || 'User'} 
                    referrerPolicy="no-referrer"
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.displayName || 'User')}`;
                    }}
                  />
                </button>

                {/* Dropdown Menu Card */}
                {isProfileDropdownOpen && (
                  <>
                    <div className="glass-panel" style={{
                      position: 'absolute',
                      top: '44px',
                      right: 0,
                      width: '280px',
                      padding: '1.25rem',
                      zIndex: 1000,
                      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={currentUser.photoURL || 'https://lh3.googleusercontent.com/a/default-user=s96-c'} 
                          alt={currentUser.displayName || 'User'} 
                          referrerPolicy="no-referrer"
                          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.displayName || 'User')}`;
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser.displayName || 'OmniSync User'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser.email}
                          </span>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '2px 0' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} color="var(--accent-emerald)" />
                          <span>Google Authenticated</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          ID: {currentUser.uid.substring(0, 14)}...
                        </div>
                      </div>

                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '2px 0' }} />

                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveTab('settings');
                          setSettingsDefaultSection('pending-tags');
                          setSettingsHideSidebar(false);
                        }}
                        style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', marginBottom: '4px' }}
                      >
                        <Settings size={14} />
                        <span>Platform Settings</span>
                      </button>

                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleSignOut();
                        }}
                        style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="content-body">
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              currentUser={currentUser}
              focusStreak={focusStreak}
              completedFocusSessions={completedFocusSessions}
              activeApplicationsCount={applications.length}
              todaysSyncs={todaysSyncs}
              priorityDeliverables={priorityDeliverables}
              completedTasksCount={pendingTasks.filter(t => t.status === 'Completed').length}
              totalTasksCount={pendingTasks.length}
              completionPercentage={pendingTasks.length > 0 ? Math.round((pendingTasks.filter(t => t.status === 'Completed').length / pendingTasks.length) * 100) : 0}
              weeklyWorkloadData={weeklyWorkloadData}
              maxCount={Math.max(...weeklyWorkloadData.map(d => d.count), 1)}
              timerMinutes={timerMinutes}
              timerSeconds={timerSeconds}
              isTimerRunning={isTimerRunning}
              setIsTimerRunning={setIsTimerRunning}
              timerMode={timerMode}
              setTimerMode={setTimerMode}
              setTimerMinutes={setTimerMinutes}
              setTimerSeconds={setTimerSeconds}
              onAddEvent={() => handleOpenAddEventModal()}
              onToggleTaskStatus={handleTogglePendingStatus}
              onNavigate={setActiveTab}
              applications={applications}
              ideas={ideas}
              meets={meets}
              generalMeets={generalMeets}
            />
          )}

          {activeTab === 'meets' && (
            (!isMeetsLoaded || !isGeneralMeetsLoaded) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton-shimmer" style={{ height: '90px', borderRadius: '12px' }} />
                  ))}
                </div>
                <div className="skeleton-shimmer" style={{ height: '110px', borderRadius: '12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton-shimmer" style={{ height: '78px', borderRadius: '12px' }} />
                  ))}
                </div>
              </div>
            ) : (
              <UnifiedMeetsWorkspace
                meets={meets}
                generalMeets={generalMeets}
                onAddGoogleMeet={handleOpenAddMeetModal}
                onEditGoogleMeet={handleOpenEditMeetModal}
                onDeleteGoogleMeet={handleDeleteMeet}
                onAddGeneralMeet={handleOpenAddGeneralMeetModal}
                onEditGeneralMeet={handleOpenEditGeneralMeetModal}
                onDeleteGeneralMeet={handleDeleteGeneralMeet}
                onLoadSamples={handleLoadSampleEvents}
              />
            )
          )}

          {activeTab === 'applications' && (
            (!isApplicationsLoaded) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton-shimmer" style={{ height: '90px', borderRadius: '12px' }} />
                  ))}
                </div>
                <div className="skeleton-shimmer" style={{ height: '60px', borderRadius: '12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton-shimmer" style={{ height: '78px', borderRadius: '12px' }} />
                  ))}
                </div>
              </div>
            ) : (
              <ApplicationsApplied
                applications={applications}
                onAddApplication={handleOpenAddApplicationModal}
                onEditApplication={handleOpenEditApplicationModal}
                onDeleteApplication={handleDeleteApplication}
                onUpdateStatus={handleUpdateApplicationStatus}
                onLoadSamples={handleLoadSampleEvents}
              />
            )
          )}

          {activeTab === 'pending' && (
            (!isPendingLoaded) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
                <div className="skeleton-shimmer" style={{ height: '80px', borderRadius: '12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="skeleton-shimmer" style={{ height: '60px', borderRadius: '12px' }} />
                  ))}
                </div>
              </div>
            ) : (
              <PendingWorkTracker
                tasks={pendingTasks}
                pendingCategories={pendingCategories}
                onAddTask={handleOpenAddPendingModal}
                onEditTask={handleOpenEditPendingModal}
                onDeleteTask={handleDeletePendingTask}
                onToggleStatus={handleTogglePendingStatus}
                onLoadSamples={handleLoadSampleEvents}
              />
            )
          )}

          {activeTab === 'ideas' && (
            (!isIdeasLoaded) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
                <div className="skeleton-shimmer" style={{ height: '80px', borderRadius: '12px' }} />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem'
                }}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="skeleton-shimmer" style={{ height: '160px', borderRadius: '12px' }} />
                  ))}
                </div>
              </div>
            ) : (
              <IdeasVault
                ideas={ideas}
                onAddIdea={handleOpenAddIdeaModal}
                onEditIdea={handleOpenEditIdeaModal}
                onDeleteIdea={handleDeleteIdea}
                onLoadSamples={handleLoadSampleEvents}
              />
            )
          )}

          {activeTab === 'calendar' && (
            (!isCalendarLoaded) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
                <div className="skeleton-shimmer" style={{ height: '60px', borderRadius: '12px' }} />
                <div className="skeleton-shimmer" style={{ height: '450px', borderRadius: '12px' }} />
              </div>
            ) : (
              <Calendar 
                events={mergedCalendarEvents}
                categories={categories}
                onSelectEvent={handleOpenEditEventModal}
                onAddEventOnDate={(date) => handleOpenAddEventModal(date)}
                searchTerm={globalSearch}
              />
            )
          )}

          {activeTab === 'daily-todos' && (
            (!isDailyTodosLoaded && currentUser) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
                <div className="skeleton-shimmer" style={{ height: '80px', borderRadius: '12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton-shimmer" style={{ height: '60px', borderRadius: '12px' }} />
                  ))}
                </div>
              </div>
            ) : (
              <DailyPlanner
                todos={dailyTodos}
                onSaveTodos={(updatedTodos) => {
                  setDailyTodos(updatedTodos);
                  saveStoredDailyTodos(updatedTodos);
                  if (currentUser) {
                    saveToUserNode(currentUser.uid, 'dailyTodos', updatedTodos);
                  }
                }}
              />
            )
          )}

          {activeTab === 'settings' && (
            <SettingsPanel 
              currentUser={currentUser}
              categories={categories}
              onSaveCategories={handleSaveCategories}
              pendingCategories={pendingCategories}
              onSavePendingCategories={handleSavePendingCategories}
              events={mergedCalendarEvents}
              applications={applications}
              pendingTasks={pendingTasks}
              onEditEvent={handleOpenEditEventModal}
              onDeleteEvent={handleDeleteEvent}
              onQuickAdd={() => handleOpenAddEventModal()}
              onImportEvents={handleImportEvents}
              onResetDefaults={handleResetDefaults}
              onLoadSamples={handleLoadSampleEvents}
              defaultSection={settingsDefaultSection}
              hideSidebar={settingsHideSidebar}
            />
          )}
        </div>
      </main>

      {/* MODAL DIALOGS */}
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        categories={categories}
        initialEvent={selectedEvent}
        defaultDate={defaultModalDate}
      />

      <PendingTaskModal 
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        onSave={handleSavePendingTask}
        onDelete={handleDeletePendingTask}
        pendingCategories={pendingCategories}
        initialTask={selectedPendingTask}
      />

      <IdeaModal
        isOpen={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        onSave={handleSaveIdea}
        onDelete={handleDeleteIdea}
        initialIdea={selectedIdea}
      />

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onSave={handleSaveApplication}
        onDelete={handleDeleteApplication}
        initialApplication={selectedApplication}
      />

      <GoogleMeetModal
        isOpen={isMeetModalOpen}
        onClose={() => setIsMeetModalOpen(false)}
        onSave={handleSaveMeet}
        onDelete={handleDeleteMeet}
        initialMeet={selectedMeet}
      />

      <GeneralMeetModal
        isOpen={isGeneralMeetModalOpen}
        onClose={() => setIsGeneralMeetModalOpen(false)}
        onSave={handleSaveGeneralMeet}
        onDelete={handleDeleteGeneralMeet}
        initialMeet={selectedGeneralMeet}
      />


    </div>
  );
}
