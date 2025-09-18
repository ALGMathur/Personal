import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated]);

  const initializeSocket = async () => {
    try {
      const token = await getAccessTokenSilently();
      
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

  const joinSession = (sessionId) => {
    if (socket && connected) {
      socket.emit('join-session', sessionId);
    }
  };

  const emitMoodUpdate = (moodData) => {
    if (socket && connected) {
      socket.emit('mood-update', moodData);
    }
  };

  const emitJournalShared = (journalData) => {
    if (socket && connected) {
      socket.emit('journal-shared', journalData);
    }
  };

  const value = {
    socket,
    connected,
    joinSession,
    emitMoodUpdate,
    emitJournalShared,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};