interface Notification {
  id: number;
  usuario_id: number;
  tipo: 'warning' | 'danger' | 'info';
  mensaje: string;
  entidad_tipo: 'ORDER' | 'SERVICE' | null;
  entidad_id: number | null;
  leido: boolean;
  url: string | null;
  creado_en: string;
  actualizado_en: string;
}
