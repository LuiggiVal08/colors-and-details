import api from './api';

export interface Employee {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  direccion: string;
  fecha_ingreso: string;
  salario_base: string;
  activo: boolean;
  empresa_id: number;
}
const getEmployeeByUserId = async (userId: number): Promise<Employee> => {
  const response = await api.get(`/employe/${userId}/user`);
  return response.data;
};
const updateEmployee = async (id: number, data: Partial<Employee>): Promise<Employee> => {
  const response = await api.put(`/employe/${id}`, data);
  return response.data;
};
export { getEmployeeByUserId, updateEmployee };
