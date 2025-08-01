import { useState, useEffect } from 'react';
import { isFirebaseAvailable, getNetworkStatus } from '../config/firebase';

const FirebaseStatus = () => {
  const [status, setStatus] = useState({
    firebase: false,
    network: false,
    lastCheck: null
  });

  useEffect(() => {
    const checkStatus = () => {
      setStatus({
        firebase: isFirebaseAvailable(),
        network: getNetworkStatus(),
        lastCheck: new Date().toLocaleTimeString()
      });
    };

    // Check status immediately
    checkStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    // Listen for network changes
    const handleOnline = () => checkStatus();
    const handleOffline = () => checkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything in production if everything is working
  if (status.firebase && status.network && import.meta.env.PROD) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: status.firebase ? '#10B981' : '#EF4444',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: status.network ? '#10B981' : '#EF4444'
        }}></div>
        <span>
          {status.firebase ? '🔥 Firebase OK' : '⚠️ Firebase Offline'}
          {!status.network && ' | 📡 No Network'}
        </span>
      </div>
      {status.lastCheck && (
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
          Last check: {status.lastCheck}
        </div>
      )}
    </div>
  );
};

export default FirebaseStatus;
