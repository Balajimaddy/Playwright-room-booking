import { Page, Locator, expect } from '@playwright/test';
import { capitalizeFirst } from '../helper/stringUtils.ts';

export class ReservationPage {
  readonly page: Page;
  readonly loginHeading: Locator;
  readonly calendarToolBar: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;

   constructor(page: Page) {
    this.page = page;
    this.loginHeading = page.getByRole('heading', { name: 'Login' });
    this.calendarToolBar = page.locator('.rbc-toolbar-label');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.backButton = page.getByRole('button', { name: 'Back' });
   }

/**
 * Find a room card by title (Double/Single/Deluxe/Elite), click "View Details",
 * and return the nightly price as a number.
 */
 async viewDetailsAndGetNightlyPrice(page: Page, roomType: string): Promise<number> {
  const normalized = capitalizeFirst(roomType);

  // Scope to the specific card layout you showed
  const card: Locator = page
    .locator('.card.border-0.shadow-sm.h-100')
    .filter({
      has: page.getByRole('heading', { name: normalized, exact: true }),
    })
    .first();

  await expect(card, `Room card "${normalized}" not found`).toBeVisible();

  // Price is inside: <span class="fw-bold text-primary">£150</span>
  const priceText = (await card.locator('.fw-bold.text-primary').first().innerText()).trim();
  const nightlyPrice = parsePriceNumber(priceText);

  // Click the card's "View Details" link
  await card.getByRole('link', { name: 'View Details', exact: true }).click();

  await expect(page).toHaveURL(/\/reservation\//);

  return nightlyPrice;
}
}
   /** Parse "£1,250.50" -> 1250.5 (no RegExp) */
function parsePriceNumber(text: string): number {
  let buf = '';
  for (const ch of text) {
    if ((ch >= '0' && ch <= '9') || ch === '.' || ch === ',') buf += ch;
  }
  const normalized = buf.split(',').join('');
  const num = parseFloat(normalized);
  if (Number.isNaN(num)) throw new Error(`Could not parse price from: "${text}"`);
  return num;
}