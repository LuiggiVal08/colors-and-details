import os from 'os';
import 'dotenv/config';

// Función para detectar la IP local automáticamente
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      // Buscamos IPv4 que no sea interna Y que no pertenezca a redes virtuales (WSL/Docker suelen usar 172.x)
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.')) {
          return iface.address; // 🚀 Prioriza tu IP real del Wi-Fi
        }
      }
    }
  }

  // Si no encuentra una 192.168, que use la primera externa como plan de respaldo
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};
export { getLocalIp };
