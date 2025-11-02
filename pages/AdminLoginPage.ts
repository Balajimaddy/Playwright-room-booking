import { Page, Locator } from '@playwright/test';

export class AdminLoginPage {
  readonly page: Page;
  readonly loginHeading: Locator;

   constructor(page: Page) {
    this.page = page;
    this.loginHeading = page.getByRole('heading', { name: 'Login' });
   }
}