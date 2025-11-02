// tests/double-room-range.spec.ts
import { test, expect, Page, Locator } from '@playwright/test';
import { addDays } from '../helper/dateUtils.ts';
import { assertRangeStartSelected , assertRangeEndSelected } from '../helper/calendar.ts'
import { HomePage } from '../pages/HomePage.ts';
import { ReservationPage } from '../pages/ReservationPage.ts';


test.describe('Validate the room booking', () => {
  test('Rooms → select dates → Check Availability → Book Double/Deluxe → calendar shows same range', async ({ page }) => {
    const homePage = new HomePage(page);
    const reservationPage = new ReservationPage(page);

    const start = addDays(new Date(), 10);
    const end = addDays(start, 3);

    console.log("START " + start);
    console.log("END " + end);

    await page.goto('/');

    await homePage.clickNav('Rooms');
    await expect(page).toHaveURL('#rooms');

    await homePage.selectDateInRoomsDatepicker(page, 0, start);
    await homePage.selectDateInRoomsDatepicker(page, 1, end);
    await homePage.checkAvailabilityBtn.click();

    const price = await homePage.bookRoomAndGetNightlyRate(page, 'Double');

    await reservationPage.calendarToolBar.waitFor();
    await assertRangeStartSelected(page, start);
    await assertRangeEndSelected(page, end);

    console.log(price);

    await expect(page.getByText(`£${price}`, { exact: true })).toBeVisible();
    await expect(page.getByText(`£${Number(price) * 3}`, { exact: true })).toBeVisible();
    
    await page.getByRole('button', { name: 'Reserve Now' }).click();

    await page.getByRole('textbox', { name: 'Firstname' }).fill("TestFirstName");

    await page.getByRole('textbox', { name: 'Lastname' }).fill("LastName");

    await page.getByRole('textbox', { name: 'Email' }).fill("test@fake.email.com");

    await page.getByRole('textbox', { name: 'Phone' }).fill("01234567890");

    await page.getByRole('button', { name: 'Reserve Now' }).click();


    await expect(page.getByText('Your booking has been confirmed')).toBeVisible({timeout: 10000});

    const expectedStartDate = new Date(start).toISOString().slice(0, 10)
    const expectedEndDate = new Date(end).toISOString().slice(0, 10)
    await expect(page.getByRole('paragraph').filter({ hasText: `${expectedStartDate} - ${expectedEndDate}` })).toBeVisible();

  });

   test('Rooms → select dates → Check Availability → view Details to change room and book it', async ({ page }) => {
    const homePage = new HomePage(page);
    const reservationPage = new ReservationPage(page);

    const start = addDays(new Date(), 10);
    const end = addDays(start, 3);

    console.log("START " + start);
    console.log("END " + end);

    await page.goto('/');

    await homePage.clickNav('Rooms');
    await expect(page).toHaveURL('#rooms');

    await homePage.selectDateInRoomsDatepicker(page, 0, start);
    await homePage.selectDateInRoomsDatepicker(page, 1, end);
    await homePage.checkAvailabilityBtn.click();

    await homePage.bookRoomAndGetNightlyRate(page, 'Double');


    await reservationPage.calendarToolBar.waitFor();
    await assertRangeStartSelected(page, start);
    await assertRangeEndSelected(page, end);

    const price = await reservationPage.viewDetailsAndGetNightlyPrice(page, 'Single');

    console.log(price);

    await expect(page.getByText(`£${price}`, { exact: true })).toBeVisible();
    await expect(page.getByText(`£${Number(price) * 3}`, { exact: true })).toBeVisible();
    
    await page.getByRole('button', { name: 'Reserve Now' }).click();

    await page.getByRole('textbox', { name: 'Firstname' }).fill("TestFirstName");

    await page.getByRole('textbox', { name: 'Lastname' }).fill("LastName");

    await page.getByRole('textbox', { name: 'Email' }).fill("test@fake.email.com");

    await page.getByRole('textbox', { name: 'Phone' }).fill("01234567890");

    await page.getByRole('button', { name: 'Reserve Now' }).click();


    await expect(page.getByText('Your booking has been confirmed')).toBeVisible({timeout: 10000});

    const expectedStartDate = new Date(start).toISOString().slice(0, 10)
    const expectedEndDate = new Date(end).toISOString().slice(0, 10)
    await expect(page.getByRole('paragraph').filter({ hasText: `${expectedStartDate} - ${expectedEndDate}` })).toBeVisible();

  });

   test('Rooms → select dates → Check Availability → Book Double/Deluxe → pre date', async ({ page }) => {
    const homePage = new HomePage(page);
    const start = addDays(new Date(), -10);
    const end = addDays(start, -3);

    console.log("START " + start);
    console.log("END " + end);

    await page.goto('/');

    await homePage.clickNav('Rooms');
    await expect(page).toHaveURL('#rooms');

    await homePage.selectDateInRoomsDatepicker(page, 0, start);
    await homePage.selectDateInRoomsDatepicker(page, 1, end);
    await homePage.checkAvailabilityBtn.click();

    await homePage.bookRoomAndGetNightlyRate(page, 'Double');
    
    await page.getByRole('button', { name: 'Reserve Now' }).click();

    await page.getByRole('textbox', { name: 'Firstname' }).fill("TestFirstName");

    await page.getByRole('textbox', { name: 'Lastname' }).fill("LastName");

    await page.getByRole('textbox', { name: 'Email' }).fill("test@fake.email.com");

    await page.getByRole('textbox', { name: 'Phone' }).fill("01234567890");

    await page.getByRole('button', { name: 'Reserve Now' }).click();


    await expect(page.getByRole('heading', { name: 'Application error: a client-' })).toBeVisible({timeout: 10000});

  });
});