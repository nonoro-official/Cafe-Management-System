const CURRENCY_CONFIG = {
  USD: { locale: 'en-US', currency: 'USD' },
  PHP: { locale: 'en-PH', currency: 'PHP' },
};

const BUSINESS_CURRENCY = import.meta.env.VITE_BUSINESS_CURRENCY || 'PHP';

export const formatCurrency = (amount) => {
  const config = CURRENCY_CONFIG[BUSINESS_CURRENCY] || CURRENCY_CONFIG.USD;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

export const QUICK_CASH_AMOUNTS =
  BUSINESS_CURRENCY === 'PHP' ? [50, 100, 500, 1000] : [5, 10, 20, 50, 100];

export const CURRENCY_SYMBOL = (0)
  .toLocaleString(CURRENCY_CONFIG[BUSINESS_CURRENCY]?.locale || 'en-US', {
    style: 'currency',
    currency: CURRENCY_CONFIG[BUSINESS_CURRENCY]?.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  .replace(/\d/g, '')
  .trim();
