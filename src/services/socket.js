import { io } from 'socket.io-client';

let socket = null;

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'https://codsm.onrender.com';

export function initSocket(userId) {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket.IO Connected to server:', socket.id);
      if (userId) {
        socket.emit('join', userId.toString());
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO Disconnected');
    });
  } else if (userId && socket.connected) {
    socket.emit('join', userId.toString());
  }
  return socket;
}

export function subscribeToIncomingRequests(userId, callback) {
  const s = initSocket(userId);
  s.on('incoming_request', callback);
  return () => {
    s.off('incoming_request', callback);
  };
}

export function subscribeToRequest(requestId, callback) {
  const s = initSocket();
  const eventName = `request_status_${requestId}`;
  s.on(eventName, callback);
  return () => {
    s.off('incoming_request', callback);
  };
}

export function subscribeToWorkerAlerts(workerId, callback) {
  const s = initSocket();
  const eventName = `worker_alert_${workerId}`;
  s.on(eventName, callback);
  return () => {
    s.off(eventName, callback);
  };
}
