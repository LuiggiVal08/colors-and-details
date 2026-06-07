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

const initialEmployees: Employee[] = [
  {
    id: 'emp-001',
    nombre: 'Laura Mendoza',
    correo: 'laura.mendoza@coloresydetalles.com',
    telefono: '0412-1234567',
    role: 'admin',
    active: true,
    priceEditEnabled: true,
  },
  {
    id: 'emp-002',
    nombre: 'Carlos Paredes',
    correo: 'carlos.paredes@coloresydetalles.com',
    telefono: '0414-7654321',
    role: 'employee',
    active: true,
    priceEditEnabled: false,
  },
  {
    id: 'emp-003',
    nombre: 'María Rodríguez',
    correo: 'maria.rodriguez@coloresydetalles.com',
    telefono: '0424-8899001',
    role: 'employee',
    active: false,
    priceEditEnabled: false,
  },
];

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
