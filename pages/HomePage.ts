import { Page, Locator, expect } from '@playwright/test';
import { formatDateToDayDateFullMonth, convertDateToChooseFormat } from '../helper/dateUtils.js';
import { capitalizeFirst } from '../helper/stringUtils.ts';

export class HomePage {
  readonly page: Page;
  readonly navbar: Locator;
  readonly ourRoomsHeading: Locator;
  readonly ourLocationHeading: Locator;
  readonly sendUsMessageHeading: Locator;
  readonly checkAvailabilityBtn: Locator;
  readonly bookNowBtn: Locator;
  readonly datePickerHeader: Locator;
  readonly nextMonthArrow: Locator;
  readonly previousMonthArrow: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.locator('#navbarNav');
    this.ourRoomsHeading = page.getByRole('heading', { name: 'Our Rooms' });
    this.ourLocationHeading = page.getByRole('heading', { name: 'Our Location' });
    this.sendUsMessageHeading = page.getByRole('heading', { name: 'Send Us a Message' });
    this.bookNowBtn =  page.getByRole('link', { name: 'Book now' });
    this.checkAvailabilityBtn = page.getByRole('button', { name: 'Check Availability' });
    this.datePickerHeader = page.locator('.react-datepicker__current-month');
    this.nextMonthArrow = page.getByRole('button', { name: 'Next Month' });
    this.previousMonthArrow = page.getByRole('button', { name: 'Previous Month' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async clickNav(name: string | RegExp): Promise<void> {
    await this.navbar.getByRole('link', { name: name }).click();
  }

  async clickBookNow(index: number): Promise<void> {
    await this.bookNowBtn.nth(index).click();
  }

  /** Pick a date in the Rooms "Check Availability" datepicker.
 *  inputIndex: 0 = check-in, 1 = check-out
 */
  async selectDateInRoomsDatepicker(page: Page, inputIndex: number, date: Date) {
    await page.getByRole('textbox').nth(inputIndex).click();

    await this.datePickerHeader.waitFor();

    for (let i = 0; i < 24; i++) {
      const label = (await this.datePickerHeader.innerText()).trim(); // e.g. "November 2025"
      if (label === formatDateToDayDateFullMonth(date)) break;
      const shown = new Date(`1 ${label}`);
      const target = new Date(date.getFullYear(), date.getMonth(), 1);
      if (shown < target) await this.nextMonthArrow.click(); else await this.previousMonthArrow.click();
    }

    const bookingDate = convertDateToChooseFormat(date);
    await page.getByRole('option', { name: bookingDate }).click();
  }

  async bookRoomAndGetNightlyRate(page: Page, roomType: string): Promise<number> {
      const normalized = capitalizeFirst(roomType);
    // Locate the card whose heading exactly matches the room type (case-insensitive)
    const card: Locator = page
      .locator('.room-card').filter({ has: page.getByRole('heading', { name: normalized, exact: true }), }).first();
    await expect(card, `Room card "${normalized}" not found`).toBeVisible();

    // Extract the price text from the card footer (e.g., "£100 per night")
    const priceText = (await card
      .locator('.card-footer')
      .getByText(/£\s*\d[\d,]*(?:\.\d{2})?/i)
      .first()
      .innerText()).trim();

    // Parse to a number: "£100" -> 100
    const price = Number(priceText.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(price)) {
      throw new Error(`Could not parse price from: "${priceText}"`);
    }

    await card.getByRole('link', { name: /book now/i }).click();

    // Optional: sanity check we navigated to a reservation page
    await expect(page).toHaveURL(/\/reservation\//);

    return price;
  }
}
