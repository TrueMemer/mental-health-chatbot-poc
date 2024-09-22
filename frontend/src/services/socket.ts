import { io, Socket } from 'socket.io-client';

let token = localStorage.getItem('token');

const socket: Socket = io('http://localhost:5000', {
  auth: {
    token: token ? `Bearer ${token}` : '',
  },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

export const updateSocketToken = (newToken: string | null) => {
  token = newToken;
  socket.auth.token = token ? `Bearer ${token}` : '';

  if (socket.connected) {
    socket.disconnect();
  }
  socket.connect();
};

export default socket;
