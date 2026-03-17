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
    // #region agent log
    fetch('http://127.0.0.1:7862/ingest/8ae7c5b4-3a5e-4c05-8757-84b8a9d6bd29',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db7918'},body:JSON.stringify({sessionId:'db7918',runId:'pre',hypothesisId:'A',location:'client/src/socket/authSocket.ts:connect',message:'Socket connected',data:{socketId:socket?.id??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
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
  // #region agent log
  fetch('http://127.0.0.1:7862/ingest/8ae7c5b4-3a5e-4c05-8757-84b8a9d6bd29',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db7918'},body:JSON.stringify({sessionId:'db7918',runId:'pre',hypothesisId:'B',location:'client/src/socket/authSocket.ts:onTokenExpiring',message:'Registered TOKEN_EXPIRING handler',data:{hasSocket:Boolean(socket)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log
  socket.on('TOKEN_EXPIRING', () => {
    // #region agent log
    fetch('http://127.0.0.1:7862/ingest/8ae7c5b4-3a5e-4c05-8757-84b8a9d6bd29',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db7918'},body:JSON.stringify({sessionId:'db7918',runId:'pre',hypothesisId:'C',location:'client/src/socket/authSocket.ts:TOKEN_EXPIRING',message:'TOKEN_EXPIRING received from server',data:{socketId:socket?.id??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
    cb();
  });
};

export const onOnlineUsersUpdate = (
  callback: (data: { users: string[]; count: number }) => void,
) => {
  socket?.on('ONLINE_USERS_UPDATE', callback);
};
