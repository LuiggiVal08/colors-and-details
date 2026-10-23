import type { PaymentEntry } from '@/feature/shopping/types';

export type Currency = 'USD' | 'VES';
export type PaymentMedium = 'efectivo' | 'digital' | 'otros';

export const isCashPayment = (tipo: string): boolean => tipo.toLowerCase() === 'efectivo';

export const paymentMedium = (tipo: string): PaymentMedium => {
  const normalized = tipo.toLowerCase();
  if (normalized === 'efectivo') return 'efectivo';
  if (['tarjeta', 'transferencia', 'digital', 'pago_movil', 'pago móvil'].includes(normalized)) return 'digital';
  return 'otros';
};

export const toUsd = (amount: number, currency: Currency, rate: number): number =>
  currency === 'USD' ? amount : rate > 0 ? amount / rate : 0;

export const toCurrency = (amountUsd: number, currency: Currency, rate: number): number =>
  currency === 'USD' ? amountUsd : amountUsd * rate;

export interface PaymentCalculation {
  appliedUsd: number;
  changeUsd: number;
  changeUsdAmount: number;
  changeBs: number;
}

export const calculatePayment = (
  amountReceived: number,
  currency: Currency,
  pendingUsd: number,
  tipo: string,
  rate: number
): PaymentCalculation => {
  const receivedUsd = toUsd(amountReceived, currency, rate);
  const cash = isCashPayment(tipo);
  const appliedUsd = cash ? Math.min(receivedUsd, pendingUsd) : receivedUsd;
  const changeUsd = cash ? Math.max(0, receivedUsd - appliedUsd) : 0;
  const forceBs = changeUsd > 0 && changeUsd < 1;

  return {
    appliedUsd,
    changeUsd,
    changeUsdAmount: forceBs ? 0 : changeUsd,
    changeBs: forceBs ? changeUsd * rate : 0,
  };
};

export const paymentsAppliedUsd = (payments: PaymentEntry[], rate: number): number =>
  payments.reduce((sum, payment) => sum + toUsd(payment.montoAplicado ?? payment.monto, payment.moneda, rate), 0);
