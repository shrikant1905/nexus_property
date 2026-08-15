// Utility formatters
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '—';
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(abs);
  return amount < 0 ? `-${formatted}` : formatted;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return dateStr;
};

export const formatPercent = (value) => {
  if (value === undefined || value === null) return '—';
  return `${value}%`;
};
