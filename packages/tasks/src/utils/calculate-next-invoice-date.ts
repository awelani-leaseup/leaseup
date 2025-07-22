import { addMonths, isAfter, isBefore, startOfDay } from 'date-fns';

export function calculateNextInvoiceDate(
  startDate: Date,
  invoiceCycle: string,
  leaseType: string
): Date {
  const now = startOfDay(new Date());
  const start = startOfDay(new Date(startDate));

  // For monthly cycles
  if (invoiceCycle === 'MONTHLY') {
    let nextDate = new Date(start);

    // Keep adding months until we find a date that's in the future
    while (isBefore(nextDate, now) || nextDate.getTime() === now.getTime()) {
      nextDate = addMonths(nextDate, 1);
    }

    return nextDate;
  }

  return isAfter(start, now) ? start : now;
}
