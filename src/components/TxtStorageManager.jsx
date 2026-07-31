import React, { useState, useRef } from 'react';
import { FileText, Download, Copy, Upload, Check, RefreshCw, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { generateTxtSchedule, downloadTxtFile, parseImportedFile } from '../utils/storage';

export default function TxtStorageManager({ events, onImportEvents, onResetDefaults, onLoadSamples }) {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const txtContent = generateTxtSchedule(events);

  const handleDownload = () => {
    downloadTxtFile(txtContent);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(txtContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const parsed = parseImportedFile(content);
      if (parsed && parsed.length > 0) {
        onImportEvents(parsed);
        setImportStatus({ success: true, count: parsed.length, msg: `Successfully imported ${parsed.length} events from TXT/JSON file!` });
      } else {
        setImportStatus({ success: false, msg: 'Unable to parse valid events from file format.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner / Backend Notice */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(34, 211, 238, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
              Local File Backend & TXT Generation Engine
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Your schedule is rendered instantly into standardized, protected `.txt` schedule logs. You can download, export, and import your event database anytime.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Import TXT File
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".txt,.json" 
            style={{ display: 'none' }} 
          />

          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} /> Download .TXT Schedule
          </button>
        </div>
      </div>

      {importStatus && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1rem 1.25rem', 
            borderColor: importStatus.success ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            color: importStatus.success ? 'var(--text-main)' : 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {importStatus.success ? <Check size={18} color="var(--accent-emerald)" /> : <AlertCircle size={18} color="var(--accent-rose)" />}
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{importStatus.msg}</div>
        </div>
      )}

      {/* Main Preview Container */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--primary)" /> Live Formatted .TXT File Output
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onLoadSamples && (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={onLoadSamples} title="Populate demo sample data for testing">
                <Sparkles size={14} color="var(--accent-cyan)" /> Load Demo Samples
              </button>
            )}

            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={handleCopy}>
              {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
              {copied ? 'Copied TXT!' : 'Copy to Clipboard'}
            </button>

            <button className="btn btn-danger" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={onResetDefaults} title="Clear all events from storage">
              <RefreshCw size={14} /> Clear All Events
            </button>
          </div>
        </div>

        {/* Monospaced Log Window */}
        <pre style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          color: 'var(--accent-cyan)',
          fontFamily: 'monospace',
          fontSize: '0.825rem',
          lineHeight: '1.6',
          maxHeight: '450px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {txtContent}
        </pre>
      </div>
    </div>
  );
}
