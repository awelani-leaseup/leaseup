import { addMonths, isAfter, isBefore } from 'date-fns';

export function calculateNextInvoiceDate(
  startDate: Date,
  invoiceCycle: string,
  endDate?: Date
): Date {
  const now = new Date();
  const nowUTC = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

  const startUTC = new Date(
    Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  );

  if (invoiceCycle === 'MONTHLY') {
    let nextDate = new Date(startUTC);

    // Keep adding months until we find a date that's in the future
    while (
      isBefore(nextDate, nowUTC) ||
      nextDate.getTime() === nowUTC.getTime()
    ) {
      nextDate = addMonths(nextDate, 1);
    }

    return nextDate;
  }

  return isAfter(startUTC, nowUTC) ? startUTC : nowUTC;
}
