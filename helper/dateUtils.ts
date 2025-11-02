// src/utils/date.ts

/** Add N days to a date (without mutating the original) */
export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function formatDateToDayDateFullMonth(d: Date): string {
  return d.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
}

/** React-Datepicker option text (no year, comma after weekday): "Choose Sunday, 9 November" */
export function convertDateToChooseFormat(d: Date): string {
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = d.getDate(); // no leading zero
  const month = d.toLocaleDateString('en-GB', { month: 'long' });
  return `Choose ${weekday}, ${day} ${month}`;
}

/** Big-calendar day buttons show zero-padded day "01".."31" */
export function removeLeadingZero(d: Date): string {
  const n = d.getDate();
  return n < 10 ? `0${n}` : `${n}`;
}
