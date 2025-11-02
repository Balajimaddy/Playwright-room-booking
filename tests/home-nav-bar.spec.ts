import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { AdminLoginPage } from '../pages/AdminLoginPage.js'

test.describe('Validate the Home Nav Bar Functions', async() => {

  test('Validate clicking nav bar links scrolling to respective section', async ({ page }) => {
    await page.goto('/');
    const homePage = new HomePage(page);

    await test.step('Click room link navbar', async() => {
      await homePage.clickNav('Rooms');
    })

    await test.step('Validate the page is scrolled to rooms section', async() => { 
      await expect(page).toHaveURL('#rooms');
      await expect(homePage.ourRoomsHeading).toBeVisible();
    })

    await test.step('Click booking link in navbar', async() => {
      await homePage.clickNav('Booking');
    })

    await test.step('Validate the page is scrolled to booking section', async() => { 
      await expect(page).toHaveURL('#booking');
      await expect(homePage.checkAvailabilityBtn).toBeVisible();
    })
    
    await test.step('Click location link in navbar', async() => {
      await homePage.clickNav('Location');
    })

    await test.step('Validate the page is scrolled to location section', async() => { 
      await expect(page).toHaveURL('#location');
      await expect(homePage.ourLocationHeading).toBeVisible();
    })

    await test.step('Click contact link in navbar', async() => {
      await homePage.clickNav('Contact');
    })

    await test.step('Validate the page is scrolled to contact section', async() => { 
      await expect(page).toHaveURL('#contact');
      await expect(homePage.sendUsMessageHeading).toBeVisible();
    })

    await test.step('Click Admin link in navbar', async() => {
      await homePage.clickNav('Admin');
    })

    await test.step('Validate the page is navigated to the admin login section', async() => { 
      const adminPage = new AdminLoginPage(page);
      await expect(page).toHaveURL('admin');
      await expect(adminPage.loginHeading).toBeVisible();
    })
  });
})
