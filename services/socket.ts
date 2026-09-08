import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '@/constants';
import { useAuthStore } from '@/store/auth';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket) return;

  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
  });

  socket.on('connect', () => {
    console.info('Socket.IO conectado');
    const user = useAuthStore.getState().user;
    if (user) {
      socket?.emit('join-room', `notifs_user_${user.id}`);
    }
  });

  socket.on('disconnect', () => {
    console.info('Socket.IO desconectado');
  });

  socket.on('connect_error', (err) => {
    console.info('Socket.IO error de conexión:', err.message);
  });

  socket.on('tasa-dolar:updated', async (data: { tasa: number; cambio?: number }) => {
    console.info('Socket.IO: tasa actualizada', data);
    const { useExchangeRateStore } = await import('@/store/exchangeRate');
    useExchangeRateStore.getState().setTasa(data.tasa, data.cambio);
  });

  socket.on('nueva_notificacion', async (notif: Notification) => {
    console.info('Socket.IO: nueva notificación', notif.mensaje);
    const { useNotificationStore } = await import('@/store/notification');
    useNotificationStore.getState().addNotification(notif);
  });

  socket.on('reporte-listo', (_data: unknown) => {
    console.info('Socket.IO: reporte listo');
  });

  socket.on('nomina_generada', (_data: unknown) => {
    console.info('Socket.IO: nómina generada');
  });

  socket.on('caja:status-changed', async (_data: unknown) => {
    console.info('Socket.IO: estado de caja cambiado');
    const { useBoxRegisterStore } = await import('@/store/boxRegister');
    useBoxRegisterStore.getState().loadActiveBox();
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.info('Socket.IO desconectado y limpiado');
  }
};

export const getSocket = (): Socket | null => socket;
