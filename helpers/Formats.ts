export const regExp = {
  name: /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,}$/,
  dni: /^[\d\s.]{7,12}$/, // Ajustado para incluir puntos
  rif: /^[VJEGP]-[0-9]{8,9}-[0-9]$/,
  username: /^[a-z0-9_.\-]{4,16}$/,
  email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  phone: /^\+58 \(\d{3}\) \d{3}-\d{4}$/,
  float: /^[0-9.]+,[0-9]{2}$/,
  // ... el resto de tus regex se mantienen
};

export class Format {
  /**
   * FORMATEADORES: Reciben un string y devuelven el string limpio/formateado.
   * Se usan directamente en el onChangeText de React Native.
   */

  static name = (value: string) => {
    return value
      .replace(/[^a-zA-ZÁÉÍÓÚÑáéíóúñ\s]/g, '') // Solo letras y espacios
      .replace(/\s+/g, ' '); // Evita múltiples espacios
  };

  static username = (value: string) => {
    // 1. Permitimos A-Z en la regex para que no las borre
    // 2. Luego convertimos todo a minúsculas
    return value.replace(/[^a-zA-Z0-9_.\-]/g, '');
  };

  static email = (value: string) => {
    return value.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase();
  };

  static dni = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) return '';
    // Formato con puntos: 26.123.456
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  static rif = (value: string) => {
    // 1. Limpiar: Solo letras permitidas y números
    let raw = value.toUpperCase().replace(/[^VJEGP0-9]/g, '');

    if (raw.length === 0) return '';

    // Asegurar que empiece con letra, si no, poner V por defecto o nada
    let letra = raw[0].match(/[VJEGP]/) ? raw[0] : '';
    let numeros = letra ? raw.slice(1) : raw;
    numeros = numeros.substring(0, 10); // Máximo de números en RIF

    if (!letra) return numeros; // Si no hay letra, solo números

    // Formatear progresivamente: V-12345678-9
    if (numeros.length > 8) {
      return `${letra}-${numeros.substring(0, numeros.length - 1)}-${numeros.substring(numeros.length - 1)}`;
    } else if (numeros.length > 0) {
      return `${letra}-${numeros}`;
    }
    return letra;
  };

  static phone = (value: string) => {
    let raw = value.replace(/\D/g, ''); // Solo números

    // Si el usuario borra todo, dejar vacío o el prefijo
    if (raw.length === 0) return '';

    // Manejar el prefijo 58
    if (raw.startsWith('58')) {
      raw = raw.substring(0, 12);
    } else {
      raw = ('58' + raw).substring(0, 12);
    }

    // +58 (412) 123-4567
    const country = '+58';
    const area = raw.substring(2, 5);
    const middle = raw.substring(5, 8);
    const last = raw.substring(8, 12);

    if (raw.length <= 2) return country;
    if (raw.length <= 5) return `${country} (${area}`;
    if (raw.length <= 8) return `${country} (${area}) ${middle}`;
    return `${country} (${area}) ${middle}-${last}`;
  };

  static float = (value: string) => {
    if (!value) return '';
    // Extraer solo números
    const raw = value.replace(/\D/g, '');
    if (!raw) return '';

    // Convertir a decimal (ej: 100 -> 1.00)
    const numberValue = parseFloat(raw) / 100;

    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
  };

  static number = (value: string) => {
    return value.replace(/[^0-9]/g, '');
  };

  static password = (value: string) => {
    // Quitar espacios en contraseñas es buena práctica
    return value.replace(/\s/g, '');
  };

  static date = (value: string) => {
    // Formato simple DD/MM/YYYY progresivo
    let raw = value.replace(/\D/g, '').substring(0, 8);
    if (raw.length <= 2) return raw;
    if (raw.length <= 4) return `${raw.substring(0, 2)}/${raw.substring(2)}`;
    return `${raw.substring(0, 2)}/${raw.substring(2, 4)}/${raw.substring(4)}`;
  };
}
