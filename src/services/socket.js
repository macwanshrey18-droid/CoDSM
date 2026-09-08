import { io } from 'socket.io-client';

let socket = null;

export function initSocket() {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket.IO Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO Disconnected');
    });
  }
  return socket;
}

export function subscribeToRequest(requestId, callback) {
  const s = initSocket();
  const eventName = `request_status_${requestId}`;
  s.on(eventName, callback);
  return () => {
    s.off(eventName, callback);
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
