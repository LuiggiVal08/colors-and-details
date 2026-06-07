import api from './api';
import type { EmployeeDebt } from '@/types/employeeDebt';

const employeeDebtService = {
  getById: async (empleadoId: number): Promise<EmployeeDebt> => {
    const { data } = await api.get<EmployeeDebt>(`/employe/deuda/${empleadoId}`);
    return data;
  },
};

export default employeeDebtService;
