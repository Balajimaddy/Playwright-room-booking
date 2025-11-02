import { expect, Locator, Page } from '@playwright/test';
import { removeLeadingZero, formatDateToDayDateFullMonth } from './dateUtils.js';
import { ReservationPage } from '../pages/ReservationPage.ts';

/** A day button (zero-padded) within the currently visible month */
export function dayButtonInThisMonth(page: Page, date: Date): Locator {
  return page
    .locator('.rbc-month-view .rbc-date-cell:not(.rbc-off-range) > .rbc-button-link')
    .filter({ hasText: removeLeadingZero(date) })
    .first();
}

/** Navigate big-calendar to the month that contains `date` */
export async function gotoCalendarMonth(page: Page, date: Date) {
  const reservationPage = new ReservationPage(page);
  for (let i = 0; i < 24; i++) {
    const label = (await reservationPage.calendarToolBar.innerText()).trim();
    if (label === formatDateToDayDateFullMonth(date)) return;
    const shown = new Date(`1 ${label}`);
    const target = new Date(date.getFullYear(), date.getMonth(), 1);
    if (shown < target) await reservationPage.nextButton.click(); else await reservationPage.backButton.click();
  }
  throw new Error(`Could not reach month ${formatDateToDayDateFullMonth(date)}`);
}

/** Wait until a "Selected" event segment is rendered (range ready) */
export async function waitForSelectedEvent(page: Page) {
  await page
    .locator('.rbc-event-content', { hasText: 'Selected' })
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 });
}

/** Cells (buttons) in the week row that contains `dayBtn` */
export function rowCells(dayBtn: Locator) {
  const monthRow = dayBtn.locator('xpath=ancestor::div[contains(@class,"rbc-month-row")]');
  return monthRow.locator('.rbc-date-cell:not(.rbc-off-range) > .rbc-button-link');
}

/** Index (0..6) of the target date inside its row */
export async function indexOfTargetInRow(dayBtn: Locator): Promise<number> {
  const cells = rowCells(dayBtn);
  const count = await cells.count();
  const targetText = (await dayBtn.innerText()).trim();
  for (let i = 0; i < count; i++) {
    const t = (await cells.nth(i).innerText()).trim();
    if (t === targetText) return i;
  }
  return -1;
}

/** The “Selected” row segment inside the row containing `dayBtn` */
export function selectedRowSegment(dayBtn: Locator, which: 'first' | 'last') {
  const monthRow = dayBtn.locator('xpath=ancestor::div[contains(@class,"rbc-month-row")]');
  const segs = monthRow.locator('.rbc-row .rbc-row-segment:has(.rbc-event-content:has-text("Selected"))');
  return which === 'first' ? segs.first() : segs.last();
}

/** Read flex-basis % from row-segments to derive start/end indices without pixels */
export async function segmentStartEndIndices(
  seg: Locator
): Promise<{ startIdx: number; endIdx: number }> {
  const { offsetPercent, widthPercent } = await seg.evaluate((el) => {
    let off = 0;
    let p = el.previousElementSibling as HTMLElement | null;
    while (p) {
      const fb = (p.style.flexBasis || p.style.maxWidth || '0').replace('%', '');
      const n = parseFloat(fb) || 0;
      off += n;
      p = p.previousElementSibling as HTMLElement | null;
    }
    const selfFb = (el as HTMLElement).style.flexBasis || (el as HTMLElement).style.maxWidth || '0';
    const width = parseFloat(selfFb.replace('%', '')) || 0;
    return { offsetPercent: off, widthPercent: width };
  });

  const cellPct = 100 / 7;
  const startIdx = Math.round(offsetPercent / cellPct);
  const daysWide = Math.round(widthPercent / cellPct);
  const endIdx = startIdx + daysWide - 1; // inclusive
  return { startIdx, endIdx };
}

/** Assert the range STARTS on `date` (compare index of date vs segment start index) */
export async function assertRangeStartSelected(page: Page, date: Date) {
  const reservationPage = new ReservationPage(page);

  await gotoCalendarMonth(page, date);
  await expect(reservationPage.calendarToolBar).toHaveText(formatDateToDayDateFullMonth(date));
  await waitForSelectedEvent(page);

  const btn = dayButtonInThisMonth(page, date);
  await expect(btn).toBeVisible();

  const targetIdx = await indexOfTargetInRow(btn);
  expect(targetIdx).toBeGreaterThanOrEqual(0);

  const seg = selectedRowSegment(btn, 'first');
  await expect(seg).toBeVisible();

  const { startIdx } = await segmentStartEndIndices(seg);
  expect(startIdx).toBe(targetIdx);
}

/** Assert the range ENDS on `date` (compare index of date vs segment end index) */
export async function assertRangeEndSelected(page: Page, date: Date) {
  const reservationPage = new ReservationPage(page);

  await gotoCalendarMonth(page, date);
  await expect(reservationPage.calendarToolBar).toHaveText(formatDateToDayDateFullMonth(date));
  await waitForSelectedEvent(page);

  const btn = dayButtonInThisMonth(page, date);
  await expect(btn).toBeVisible();

  const targetIdx = await indexOfTargetInRow(btn);
  expect(targetIdx).toBeGreaterThanOrEqual(0);

  const seg = selectedRowSegment(btn, 'last');
  await expect(seg).toBeVisible();

  const { endIdx } = await segmentStartEndIndices(seg);
  expect(endIdx).toBe(targetIdx);
}
