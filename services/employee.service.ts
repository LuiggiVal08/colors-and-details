import { type Employee, type CreateEmployeeDTO, type UpdateEmployeeDTO } from '@/types/employee';
import api from './api';

const employeeService = {
  getAll: async (page: number = 1, limit: number = 20): Promise<Employee[]> => {
    const response = await api.get<Employee[]>('/employe', { params: { page, limit } });
    return response.data;
  },
  getById: async (id: string): Promise<Employee> => {
    const response = await api.get<Employee>(`/employe/${id}`);
    return response.data;
  },
  create: async (data: CreateEmployeeDTO): Promise<Employee> => {
    const response = await api.post<Employee>('/employe', data);
    return response.data;
  },
  update: async (id: string, data: UpdateEmployeeDTO): Promise<Employee> => {
    const response = await api.put(`/employe/${id}`, data);
    return response.data;
  },
  search: async (query: string, page: number = 1, limit: number = 20): Promise<Employee[]> => {
    const { data } = await api.get<Employee[]>('/employe', {
      params: {
        search: query,
        page,
        limit,
      },
    });
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/employe/${id}`);
  },
  getEmployeeByUserId: async (userId: number): Promise<Employee> => {
    const response = await api.get(`/employe/${userId}/user`);
    return response.data;
  },
};

export default employeeService;
