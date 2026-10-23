export const parseDecimal = (value: string | number | null | undefined): number => {
  const normalized = String(value ?? '')
    .trim()
    .replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const toDecimalString = (value: string | number | null | undefined): string =>
  String(value ?? '')
    .trim()
    .replace('.', ',');
