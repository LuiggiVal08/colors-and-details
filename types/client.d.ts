export interface Client {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  direccion: string;
  fecha_registro: string;
  activo: boolean;
}

export type CreateClientDTO = Omit<Client, 'id' | 'fecha_registro'>;

export type UpdateClientDTO = Partial<Omit<Client, 'id' | 'fecha_registro'>>;
