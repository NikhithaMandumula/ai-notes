import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket } from '../services/socket';
import { fetchReceivedShares, fetchSentShares, fetchPendingShareCount } from '../services/api';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [receivedShares, setReceivedShares] = useState([]);
  const [sentShares, setSentShares] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [notification, setNotification] = useState(null);

  // Connect/disconnect socket based on auth state
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const handleReceived = (share) => {
      setReceivedShares((prev) => [share, ...prev]);
      setPendingCount((prev) => prev + 1);
      setNotification({
        id: share._id,
        message: `${share.fromUserId?.name || 'Someone'} shared "${share.noteId?.title || 'a note'}" with you`,
        timestamp: Date.now(),
      });
    };

    socket.on('note:received', handleReceived);

    return () => {
      socket.off('note:received', handleReceived);
      disconnectSocket();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const id = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(id);
  }, [notification]);

  // Load initial share data when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setReceivedShares([]);
      setSentShares([]);
      setPendingCount(0);
      return;
    }
    loadShares();
  }, [isAuthenticated]);

  const loadShares = useCallback(async () => {
    try {
      const [received, sent, countData] = await Promise.all([
        fetchReceivedShares(),
        fetchSentShares(),
        fetchPendingShareCount(),
      ]);
      setReceivedShares(received);
      setSentShares(sent);
      setPendingCount(countData.count);
    } catch (err) {
      console.error('Failed to load shares:', err);
    }
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <SocketContext.Provider value={{
      receivedShares,
      sentShares,
      pendingCount,
      notification,
      dismissNotification,
      loadShares,
      setReceivedShares,
      setSentShares,
      setPendingCount,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
