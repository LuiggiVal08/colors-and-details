export interface DebtPeriod {
  fecha_inicio: string;
  fecha_fin: string;
  monto_esperado: number;
  pagado: boolean;
  monto_pagado: number;
  monto_pagado_bs: number;
  bono: number;
  deduccion: number;
  nomina_id: number;
}

export interface DebtPayment {
  fecha_fin: string;
  monto: number;
}

export interface EmployeeDebt {
  empleado_id: number;
  frecuencia: string;
  salario_base: number;
  periodos: DebtPeriod[];
  total_esperado: number;
  total_pagado: number;
  total_pagado_bs: number;
  total_bono: number;
  total_deduccion: number;
  deuda: number;
  periodos_vencidos: number;
  periodos_pagados: number;
  proximo_pago: DebtPayment | null;
  ultimo_pago: DebtPayment | null;
  dias_sin_pago: number;
}
