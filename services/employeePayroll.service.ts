import api from './api';
import type { EmployeePayroll, CreateEmployeePayrollDTO } from '@/types/employeePayroll';

const employeePayrollService = {
  create: async (data: CreateEmployeePayrollDTO): Promise<EmployeePayroll> => {
    const { data: response } = await api.post<EmployeePayroll>('/employee-payroll', data);
    return response;
  },

  getById: async (id: string): Promise<EmployeePayroll> => {
    const { data } = await api.get<EmployeePayroll>(`/employee-payroll/${id}`);
    return data;
  },

  update: async (id: string, data: Partial<CreateEmployeePayrollDTO>): Promise<EmployeePayroll> => {
    const { data: response } = await api.put<EmployeePayroll>(`/employee-payroll/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/employee-payroll/${id}`);
  },
};

export default employeePayrollService;
