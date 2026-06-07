// Re-export from types/employee.d.ts
export type { Employee, CreateEmployeeDTO, UpdateEmployeeDTO } from '@/types/employee';

export interface EmployeeCardProps {
  employee: Employee;
  onPress?: (employee: Employee) => void;
}

export interface EmployeesListProps {
  employees: Employee[];
}

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}
