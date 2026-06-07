import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '@/constants';
import { useAuthStore } from '@/store/auth';
import { useExchangeRateStore } from '@/store/exchangeRate';
import { useBoxRegisterStore } from '@/store/boxRegister';
import { useNotificationStore } from '@/store/notification';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket?.connected) return;

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

  socket.on('tasa-dolar:updated', (data: { tasa: number; cambio?: number }) => {
    console.info('Socket.IO: tasa actualizada', data);
    useExchangeRateStore.getState().setTasa(data.tasa, data.cambio);
  });

  socket.on('nueva_notificacion', (notif: Notification) => {
    console.info('Socket.IO: nueva notificación', notif.mensaje);
    useNotificationStore.getState().addNotification(notif);
  });

  socket.on('reporte-listo', (_data: unknown) => {
    console.info('Socket.IO: reporte listo');
  });

  socket.on('nomina_generada', (_data: unknown) => {
    console.info('Socket.IO: nómina generada');
  });

  socket.on('caja:status-changed', (_data: unknown) => {
    console.info('Socket.IO: estado de caja cambiado');
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
