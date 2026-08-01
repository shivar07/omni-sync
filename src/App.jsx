import React, { Component } from 'react';
import MainApp from './components/MainApp';

// Global error boundary to capture React render errors safely
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Omni-Sync Error Boundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 800 }}>Something went wrong</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '500px' }}>
            Omni-Sync encountered an unexpected error. Please refresh the page or try clearing your storage.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Initial application shell loader skeleton
function AppLoader() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* Sidebar Skeleton */}
      <div style={{
        width: '280px',
        borderRight: '1px solid #cbd5e1',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ height: '40px', backgroundColor: '#e2e8f0', borderRadius: '8px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: '36px', backgroundColor: '#f1f5f9', borderRadius: '6px' }} />
          ))}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '200px', height: '32px', backgroundColor: '#e2e8f0', borderRadius: '6px' }} />
          <div style={{ width: '120px', height: '32px', backgroundColor: '#e2e8f0', borderRadius: '6px' }} />
        </div>
        <div style={{ height: '200px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1 }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px' }} />
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px' }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    // Mimic initialization step for data hydration checks
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return <AppLoader />;
  }

  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
