import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectAuthSocket = () => {
  if (socket) return;

  socket = io('http://localhost:3001', {
    withCredentials: true,
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('WS connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('WS disconnected');
  });
};

export const disconnectAuthSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const onTokenExpiring = (cb: () => void) => {
  if (!socket) return;
  socket.off('TOKEN_EXPIRING');
  socket.on('TOKEN_EXPIRING', cb);
};
