import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Calendar as CalendarIcon, 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Edit2,
  FileCheck2,
  Table,
  FileText,
  Bell,
  Smartphone,
  Send,
  Wifi
} from 'lucide-react';
import { ref, onValue, set, get, update } from 'firebase/database';
import { db } from '../firebase';
import { DEFAULT_CATEGORIES, DEFAULT_PENDING_CATEGORIES } from '../utils/storage';
import { pushNotificationToUserFirebase } from '../utils/firebaseStorage';
import TaskSummaryTable from './TaskSummaryTable';
import TxtStorageManager from './TxtStorageManager';

const PRESET_COLORS = [
  '#f43f5e', // Rose
  '#3b82f6', // Electric Blue
  '#22d3ee', // Cyan
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#64748b'  // Slate
];

export default function SettingsPanel({ 
  currentUser,
  categories, 
  onSaveCategories,
  pendingCategories = [],
  onSavePendingCategories,
  events = [],
  applications = [],
  pendingTasks = [],
  onEditEvent,
  onDeleteEvent,
  onQuickAdd,
  onImportEvents,
  onResetDefaults,
  onLoadSamples,
  defaultSection,
  hideSidebar = false
}) {
  const [activeSection, setActiveSection] = useState(defaultSection || 'pending-tags');

  useEffect(() => {
    if (defaultSection) {
      setActiveSection(defaultSection);
    }
  }, [defaultSection]);

  // Notification Portal state
  const [selectedPortalItem, setSelectedPortalItem] = useState(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customType, setCustomType] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [syncCode, setSyncCode] = useState('');
  const [syncStatus, setSyncStatus] = useState('loading'); // 'loading', 'pending', 'connected'
  const [pairedDevice, setPairedDevice] = useState('');

  useEffect(() => {
    if (!currentUser || activeSection !== 'notification-portal') return;

    const uid = currentUser.uid;
    const userCodeRef = ref(db, `user_sync_codes/${uid}`);

    let isSubscribed = true;
    let unsubscribeCodeListener = null;

    // Listen to user's pairing code in real time
    const unsubscribeUserCode = onValue(userCodeRef, async (snapshot) => {
      if (!isSubscribed) return;
      
      const code = snapshot.val();
      
      // Clean up previous code listener if any
      if (unsubscribeCodeListener) {
        unsubscribeCodeListener();
        unsubscribeCodeListener = null;
      }

      if (!code) {
        // If there's no code (never paired or just got disconnected/deleted by phone),
        // generate a new one automatically so the user is ready to pair again!
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save pairing mapping
        await set(ref(db, `sync_codes/${newCode}`), {
          uid,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        // Save mapping under user
        await set(userCodeRef, newCode);
        return;
      }

      setSyncCode(code);

      // Listen to pairing status updates for this specific code
      const codeRef = ref(db, `sync_codes/${code}`);
      unsubscribeCodeListener = onValue(codeRef, (codeSnapshot) => {
        if (!isSubscribed) return;
        const data = codeSnapshot.val();
        if (data) {
          setSyncStatus(data.status || 'pending');
          setPairedDevice(data.deviceId || '');
        } else {
          setSyncStatus('pending');
        }
      });
    });

    return () => {
      isSubscribed = false;
      unsubscribeUserCode();
      if (unsubscribeCodeListener) {
        unsubscribeCodeListener();
      }
    };
  }, [currentUser, activeSection]);


  const handleUnpairDevice = async () => {
    if (!currentUser || !syncCode) return;
    try {
      await set(ref(db, `sync_codes/${syncCode}`), null);
      await set(ref(db, `user_sync_codes/${currentUser.uid}`), null);
      setSyncStatus('pending');
      setPairedDevice('');
      showNotification('Mobile companion device unlinked successfully!');
    } catch (err) {
      console.error("Error unpairing device:", err);
      showNotification('Failed to unpair device');
    }
  };

  // Calendar Tag Form state
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#3b82f6');

  // Pending Work Tag Form state
  const [newPendingName, setNewPendingName] = useState('');
  const [newPendingColor, setNewPendingColor] = useState('#f43f5e');
  const [editingPendingId, setEditingPendingId] = useState(null);
  const [editingPendingName, setEditingPendingName] = useState('');
  const [editingPendingColor, setEditingPendingColor] = useState('#f43f5e');

  const [statusMsg, setStatusMsg] = useState(null);

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  // --- Calendar Tags Handlers ---
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    if (categories.some(c => c.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      showNotification('A calendar tag with this name already exists!');
      return;
    }

    const newCat = {
      id: 'cat-' + Date.now(),
      name: newTagName.trim(),
      color: newTagColor
    };

    onSaveCategories([...categories, newCat]);
    setNewTagName('');
    showNotification(`Added calendar tag: "${newCat.name}"!`);
  };

  const handleDeleteCategory = (catId) => {
    if (categories.length <= 1) {
      showNotification('You must keep at least one category tag.');
      return;
    }
    onSaveCategories(categories.filter(c => c.id !== catId));
    showNotification('Tag removed successfully.');
  };

  const handleSaveEdit = (catId) => {
    if (!editingName.trim()) return;
    onSaveCategories(categories.map(c => 
      c.id === catId ? { ...c, name: editingName.trim(), color: editingColor } : c
    ));
    setEditingId(null);
    showNotification('Category updated!');
  };

  // --- Pending Work Tags Handlers ---
  const handleAddPendingCategory = (e) => {
    e.preventDefault();
    if (!newPendingName.trim()) return;

    if (pendingCategories.some(c => c.name.toLowerCase() === newPendingName.trim().toLowerCase())) {
      showNotification('A pending work category with this name already exists!');
      return;
    }

    const newCat = {
      id: 'pcat-' + Date.now(),
      name: newPendingName.trim(),
      color: newPendingColor
    };

    onSavePendingCategories([...pendingCategories, newCat]);
    setNewPendingName('');
    showNotification(`Added pending work category: "${newCat.name}"!`);
  };

  const handleDeletePendingCategory = (catId) => {
    if (pendingCategories.length <= 1) {
      showNotification('You must keep at least one pending category tag.');
      return;
    }
    onSavePendingCategories(pendingCategories.filter(c => c.id !== catId));
    showNotification('Pending category removed.');
  };

  const handleSavePendingEdit = (catId) => {
    if (!editingPendingName.trim()) return;
    onSavePendingCategories(pendingCategories.map(c => 
      c.id === catId ? { ...c, name: editingPendingName.trim(), color: editingPendingColor } : c
    ));
    setEditingPendingId(null);
    showNotification('Pending work category updated!');
  };

  const handleSendTestNotification = async () => {
    if (!customTitle.trim() || !customMessage.trim()) {
      showNotification('Please enter a Title and Message first.');
      return;
    }
    if (!currentUser) {
      showNotification('Error: User not logged in.');
      return;
    }
    setIsSending(true);
    try {
      await pushNotificationToUserFirebase(
        currentUser.uid,
        customTitle.trim(),
        customMessage.trim(),
        customType.trim(),
        customLink.trim(),
        customNotes.trim()
      );
      showNotification('Success: Test notification dispatched!');
    } catch (err) {
      showNotification('Error: Failed to push notification.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', minHeight: '80vh' }}>
      {/* Settings Sidebar / Navigation */}
      {!hideSidebar && (
        <div className="glass-panel" style={{ width: '260px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '0.85rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <Settings size={18} color="var(--primary)" />
            <span style={{ fontWeight: 850, fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>Platform Config</span>
          </div>

          <button 
            className={`nav-item ${activeSection === 'pending-tags' ? 'active' : ''}`}
            onClick={() => setActiveSection('pending-tags')}
          >
            <FileCheck2 size={16} />
            <span>Pending Work Tags</span>
          </button>

          <button 
            className={`nav-item ${activeSection === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveSection('calendar')}
          >
            <CalendarIcon size={16} />
            <span>Calendar Event Tags</span>
          </button>

          <button 
            className={`nav-item ${activeSection === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveSection('summary')}
          >
            <Table size={16} />
            <span>Tabular Task Summary</span>
          </button>

          <button 
            className={`nav-item ${activeSection === 'storage-engine' ? 'active' : ''}`}
            onClick={() => setActiveSection('storage-engine')}
          >
            <FileText size={16} />
            <span>TXT Backup Engine</span>
          </button>

          <button 
            className={`nav-item ${activeSection === 'notification-portal' ? 'active' : ''}`}
            onClick={() => setActiveSection('notification-portal')}
          >
            <Smartphone size={16} />
            <span>Notification Portal</span>
          </button>
        </div>
      )}

      {/* Main Settings Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {statusMsg && (
          <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', borderColor: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{statusMsg}</span>
          </div>
        )}

        {/* PENDING WORK TAGS SECTION */}
        {activeSection === 'pending-tags' && (
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck2 size={20} color="var(--accent-rose)" /> Dynamic Pending Work & Application Categories
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Add and customize category tags for classifying hackathon forms, internship applications, errands, and form submissions.
              </p>
            </div>

            {/* Form */}
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} color="var(--accent-rose)" /> Create New Pending Category Tag
              </div>

              <form onSubmit={handleAddPendingCategory} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '220px' }}>
                  <label className="form-label">Category Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Fee Payment, Hardware Purchase, Lab Report..."
                    value={newPendingName}
                    onChange={(e) => setNewPendingName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color Swatch</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {PRESET_COLORS.map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setNewPendingColor(col)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          backgroundColor: col,
                          border: newPendingColor === col ? '2px solid white' : '1px solid transparent',
                          cursor: 'pointer',
                          boxShadow: newPendingColor === col ? `0 0 8px ${col}` : 'none'
                        }}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={newPendingColor} 
                      onChange={(e) => setNewPendingColor(e.target.value)}
                      style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                  <Plus size={16} /> Add Pending Tag
                </button>
              </form>
            </div>

            {/* List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Active Pending Categories ({pendingCategories.length})
                </div>

                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }} 
                  onClick={() => {
                    onSavePendingCategories(DEFAULT_PENDING_CATEGORIES);
                    showNotification('Reset pending categories to defaults.');
                  }}
                >
                  <RotateCcw size={14} /> Reset Defaults
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {pendingCategories.map((cat) => {
                  const isEditing = editingPendingId === cat.id;

                  return (
                    <div 
                      key={cat.id || cat.name} 
                      style={{
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem 1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
                          <input 
                            type="color" 
                            value={editingPendingColor}
                            onChange={(e) => setEditingPendingColor(e.target.value)}
                            style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
                          />
                          <input 
                            type="text"
                            className="form-input"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                            value={editingPendingName}
                            onChange={(e) => setEditingPendingName(e.target.value)}
                          />
                          <button className="btn btn-primary" style={{ padding: '4px 8px' }} onClick={() => handleSavePendingEdit(cat.id)}>
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span 
                              style={{ 
                                width: 14, 
                                height: 14, 
                                borderRadius: '50%', 
                                backgroundColor: cat.color || '#f43f5e',
                                boxShadow: `0 0 8px ${cat.color || '#f43f5e'}`
                              }} 
                            />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '5px 8px' }}
                              onClick={() => {
                                setEditingPendingId(cat.id);
                                setEditingPendingName(cat.name);
                                setEditingPendingColor(cat.color || '#f43f5e');
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '5px 8px' }}
                              onClick={() => handleDeletePendingCategory(cat.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CALENDAR TAGS SECTION */}
        {activeSection === 'calendar' && (
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} color="var(--primary)" /> Dynamic Calendar Event Categories
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Customize and add new tags for classifying your workshops, email notices, and webinars.
              </p>
            </div>

            {/* Add New Tag Form */}
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} color="var(--accent-cyan)" /> Create New Calendar Tag
              </div>

              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                  <label className="form-label">Tag Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Conference, Interview, Exam..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {PRESET_COLORS.map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setNewTagColor(col)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          backgroundColor: col,
                          border: newTagColor === col ? '2px solid white' : '1px solid transparent',
                          cursor: 'pointer',
                          boxShadow: newTagColor === col ? `0 0 8px ${col}` : 'none'
                        }}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={newTagColor} 
                      onChange={(e) => setNewTagColor(e.target.value)}
                      style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                  <Plus size={16} /> Add Tag
                </button>
              </form>
            </div>

            {/* List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Active Tag Collection ({categories.length})
                </div>

                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }} 
                  onClick={() => {
                    onSaveCategories(DEFAULT_CATEGORIES);
                    showNotification('Categories reset to defaults.');
                  }}
                >
                  <RotateCcw size={14} /> Reset Defaults
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;

                  return (
                    <div 
                      key={cat.id} 
                      style={{
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem 1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
                          <input 
                            type="color" 
                            value={editingColor}
                            onChange={(e) => setEditingColor(e.target.value)}
                            style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
                          />
                          <input 
                            type="text"
                            className="form-input"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                          />
                          <button className="btn btn-primary" style={{ padding: '4px 8px' }} onClick={() => handleSaveEdit(cat.id)}>
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span 
                              style={{ 
                                width: 14, 
                                height: 14, 
                                borderRadius: '50%', 
                                backgroundColor: cat.color || '#3b82f6',
                                boxShadow: `0 0 8px ${cat.color || '#3b82f6'}`
                              }} 
                            />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '5px 8px' }}
                              onClick={() => {
                                setEditingId(cat.id);
                                setEditingName(cat.name);
                                setEditingColor(cat.color || '#3b82f6');
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '5px 8px' }}
                              onClick={() => handleDeleteCategory(cat.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TABULAR TASK SUMMARY SECTION */}
        {activeSection === 'summary' && (
          <TaskSummaryTable 
            events={events}
            categories={categories}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            onQuickAdd={onQuickAdd}
          />
        )}

        {/* TXT BACKUP ENGINE SECTION */}
        {activeSection === 'storage-engine' && (
          <TxtStorageManager 
            events={events}
            onImportEvents={onImportEvents}
            onResetDefaults={onResetDefaults}
            onLoadSamples={onLoadSamples}
          />
        )}

        {/* NOTIFICATION PORTAL SECTION */}
        {activeSection === 'notification-portal' && (
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone size={22} color="var(--accent-cyan)" /> Mobile Companion Hub
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Pair your mobile device via 6-digit sync code and manage real-time push alert dispatches.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-glass)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: syncStatus === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                  boxShadow: syncStatus === 'connected' ? '0 0 10px #10b981' : '0 0 8px #f59e0b',
                  animation: syncStatus !== 'connected' ? 'pulse 1.5s infinite ease-in-out' : 'none'
                }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: syncStatus === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-amber)', letterSpacing: '0.05em' }}>
                  {syncStatus === 'connected' ? 'Phone Paired & Active' : 'Waiting for Device Pair'}
                </span>
              </div>
            </div>

            {/* IF NOT CONNECTED: SHOW ONLY PAIRING CODE WIZARD */}
            {syncStatus !== 'connected' ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '3rem 2rem',
                textAlign: 'center',
                gap: '1.5rem',
                maxWidth: '520px',
                margin: '1rem auto'
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(34, 211, 238, 0.15) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(34, 211, 238, 0.15)'
                }}>
                  <Wifi size={40} color="var(--accent-cyan)" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                    Link Your Companion Phone
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Launch the <strong>OmniSync</strong> app on your Android phone or laptop emulator and enter the 6-digit pairing code below.
                  </p>
                </div>

                {/* 6-DIGIT SYNC CODE DISPLAY */}
                <div style={{ 
                  background: 'var(--bg-dark)', 
                  border: '2px dashed var(--accent-cyan)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 25px rgba(34, 211, 238, 0.1)',
                  margin: '0.5rem 0'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    YOUR PAIRING CODE
                  </span>
                  <span style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 950, 
                    letterSpacing: '0.25em', 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--accent-cyan)',
                    textShadow: '0 0 15px rgba(34, 211, 238, 0.4)'
                  }}>
                    {syncCode || '------'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-amber)', animation: 'pulse 1.5s infinite' }} />
                  <span>Listening for device response in real-time...</span>
                </div>
              </div>
            ) : (
              /* IF CONNECTED: SHOW SUCCESS BANNER AND TESTING DASHBOARD WITH ANIMATION */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeInUp 0.3s ease-out' }}>
                <div className="glass-panel" style={{
                  padding: '1.25rem 1.5rem',
                  borderColor: 'var(--accent-emerald)',
                  background: 'rgba(16, 185, 129, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={20} color="white" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>Phone Linked Successfully!</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Connected Device ID: <code>{pairedDevice}</code>
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      Code: {syncCode}
                    </span>
                    <button 
                      onClick={handleUnpairDevice}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '4px 10px', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)', fontWeight: 700 }}
                    >
                      Disconnect Phone
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                  {/* Event selector panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Wifi size={16} color="var(--accent-cyan)" /> Select Active Event or Application
                    </div>
                    
                    <div style={{ 
                      maxHeight: '400px', 
                      overflowY: 'auto', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      background: 'var(--bg-glass)'
                    }}>
                      {/* Applications list */}
                      {applications.map((app) => (
                        <div 
                          key={`app-${app.id}`}
                          onClick={() => {
                            setSelectedPortalItem(app);
                            setCustomTitle(app.title);
                            setCustomMessage(`Your reminder for "${app.title}" is due now!`);
                            setCustomType('Application');
                            setCustomLink(app.link || '');
                            setCustomNotes(app.notes || '');
                          }}
                          style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: selectedPortalItem?.id === app.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                            border: `1px solid ${selectedPortalItem?.id === app.id ? 'var(--primary)' : 'var(--border-color)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{app.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {app.status || 'Applied'}</div>
                          </div>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', fontWeight: 600 }}>
                            App
                          </span>
                        </div>
                      ))}

                      {/* Events list */}
                      {events.map((evt) => (
                        <div 
                          key={`evt-${evt.id}`}
                          onClick={() => {
                            setSelectedPortalItem(evt);
                            setCustomTitle(evt.title);
                            setCustomMessage(`Event Alert: "${evt.title}" is scheduled!`);
                            setCustomType('Calendar Event');
                            setCustomLink(evt.link || '');
                            setCustomNotes(evt.notes || '');
                          }}
                          style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: selectedPortalItem?.id === evt.id ? 'rgba(34, 211, 238, 0.15)' : 'var(--bg-card)',
                            border: `1px solid ${selectedPortalItem?.id === evt.id ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{evt.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {evt.startDate}</div>
                          </div>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            Calendar
                          </span>
                        </div>
                      ))}

                      {/* Pending tasks list */}
                      {pendingTasks.map((task) => (
                        <div 
                          key={`task-${task.id}`}
                          onClick={() => {
                            setSelectedPortalItem(task);
                            setCustomTitle(task.title);
                            setCustomMessage(`Task Alert: Don't forget to complete "${task.title}"!`);
                            setCustomType('Pending Task');
                            setCustomLink(task.link || '');
                            setCustomNotes(task.notes || '');
                          }}
                          style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: selectedPortalItem?.id === task.id ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                            border: `1px solid ${selectedPortalItem?.id === task.id ? 'var(--accent-amber)' : 'var(--border-color)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{task.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {task.dueDate || 'No date'}</div>
                          </div>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', fontWeight: 600 }}>
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payload Builder form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Send size={16} color="var(--primary)" /> Configure Push Alert Payload
                    </div>

                    <div className="form-group">
                      <label className="form-label">Alert Title</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={customTitle} 
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="e.g. Action Required"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Alert Category / Type</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={customType} 
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="e.g. Application, Hackathon, Interview"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Notification Message Summary</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={customMessage} 
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="e.g. Deadline is approaching today!"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Action Link URL (Clickable in Push Alert)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={customLink} 
                        onChange={(e) => setCustomLink(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Detailed Notes / Description</label>
                      <textarea 
                        className="form-input"
                        style={{ minHeight: '75px', resize: 'vertical' }}
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Enter detailed instructions or description..."
                      />
                    </div>

                    <button 
                      onClick={handleSendTestNotification}
                      disabled={isSending}
                      className="btn btn-primary" 
                      style={{ 
                        padding: '0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        fontWeight: 700
                      }}
                    >
                      <Send size={16} />
                      {isSending ? 'Sending payload...' : 'Push to Mobile'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
