export const formatCurrencyToZAR = (amount: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);
};

export const convertToCents = (amount: number) => {
  return Math.round(amount * 100);
};

export const convertFromCents = (amount: number) => {
  return amount / 100;
};
