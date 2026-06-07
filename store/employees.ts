import { create } from 'zustand';

export type EmployeeRole = 'admin' | 'employee';

export interface Employee {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  role: EmployeeRole;
  active: boolean;
  priceEditEnabled: boolean;
}

interface EmployeesState {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  toggleEmployeeActive: (employeeId: string) => void;
  togglePriceEditPermission: (employeeId: string) => void;
  setEmployees: (employees: Employee[]) => void;
}

const initialEmployees: Employee[] = [];

export const useEmployeesStore = create<EmployeesState>((set) => ({
  employees: initialEmployees,
  addEmployee: (employee) =>
    set((state) => ({
      employees: [
        ...state.employees,
        {
          id: `emp-${Date.now()}`,
          ...employee,
        },
      ],
    })),
  toggleEmployeeActive: (employeeId) =>
    set((state) => ({
      employees: state.employees.map((employee) =>
        employee.id === employeeId ? { ...employee, active: !employee.active } : employee
      ),
    })),
  togglePriceEditPermission: (employeeId) =>
    set((state) => ({
      employees: state.employees.map((employee) =>
        employee.id === employeeId ? { ...employee, priceEditEnabled: !employee.priceEditEnabled } : employee
      ),
    })),
  setEmployees: (employees) => set({ employees }),
}));
