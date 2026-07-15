import { expect, test, chromium } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionPath = resolve(__dirname, '../..');

let context;
let userDataDir;
let extensionId;

async function findExtensionId(contextRef) {
  const page = await contextRef.newPage();
  await page.goto('chrome://extensions/');
  await page.waitForTimeout(1000);

  const id = await page.evaluate(() => {
    const manager = document.querySelector('extensions-manager');
    const list = manager?.shadowRoot?.querySelector('extensions-item-list');
    const items = [...(list?.shadowRoot?.querySelectorAll('extensions-item') ?? [])];
    const pttPalette = items.find((item) => item.shadowRoot?.querySelector('#name')?.textContent?.trim() === 'PTT Palette');

    return pttPalette?.getAttribute('id');
  });

  await page.close();
  return id;
}

async function setExtensionPreferences(contextRef, id, preferences) {
  const page = await contextRef.newPage();
  await page.goto(`chrome-extension://${id}/src/popup.html`);
  await page.evaluate((items) => new Promise((resolvePromise, reject) => {
    chrome.storage.sync.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolvePromise();
    });
  }), preferences);
  await page.close();
}

async function openThemedPage(url) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-ptt-palette-theme', 'tracker');
  await expect(page.locator('html')).toHaveAttribute('data-ptt-palette-density', 'compact');
  return page;
}

async function expectLightSurface(locator) {
  await expect(locator).toBeVisible();
  const background = await locator.evaluate((element) => getComputedStyle(element).backgroundColor);

  expect(background).not.toBe('rgb(0, 0, 0)');
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
}

async function expectReadableText(locator) {
  await expect(locator).toBeVisible();
  const color = await locator.evaluate((element) => getComputedStyle(element).color);

  expect(color).not.toBe('rgb(255, 255, 255)');
  expect(color).not.toBe('rgba(255, 255, 255, 0)');
}

async function expectNoHorizontalOverlap(leftLocator, rightLocator) {
  await expect(leftLocator).toBeVisible();
  await expect(rightLocator).toBeVisible();

  const leftBox = await leftLocator.boundingBox();
  const rightBox = await rightLocator.boundingBox();

  expect(leftBox).toBeTruthy();
  expect(rightBox).toBeTruthy();
  expect(leftBox.x + leftBox.width).toBeLessThanOrEqual(rightBox.x + 1);
}

async function expectContainedHorizontally(innerLocator, outerLocator) {
  await expect(innerLocator).toBeVisible();
  await expect(outerLocator).toBeVisible();

  const innerBox = await innerLocator.boundingBox();
  const outerBox = await outerLocator.boundingBox();

  expect(innerBox).toBeTruthy();
  expect(outerBox).toBeTruthy();
  expect(innerBox.x).toBeGreaterThanOrEqual(outerBox.x - 1);
  expect(innerBox.x + innerBox.width).toBeLessThanOrEqual(outerBox.x + outerBox.width + 1);
}

async function expectStackedAbove(upperLocator, lowerLocator) {
  await expect(upperLocator).toBeVisible();
  await expect(lowerLocator).toBeVisible();

  const upperBox = await upperLocator.boundingBox();
  const lowerBox = await lowerLocator.boundingBox();

  expect(upperBox).toBeTruthy();
  expect(lowerBox).toBeTruthy();
  expect(upperBox.y + upperBox.height).toBeLessThanOrEqual(lowerBox.y);
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  userDataDir = mkdtempSync(join(tmpdir(), 'ptt-palette-e2e-'));
  context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
  extensionId = await findExtensionId(context);

  expect(extensionId).toBeTruthy();

  await setExtensionPreferences(context, extensionId, {
    theme: 'tracker',
    density: 'compact',
    hideBranding: false,
  });
});

test.afterAll(async () => {
  await context?.close();

  if (userDataDir) {
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('applies Office theme to hot board rows without column overlap', async ({}, testInfo) => {
  const page = await openThemedPage('https://www.ptt.cc/bbs/hotboards.html');

  await expectLightSurface(page.locator('.b-list-container'));
  await expect(page.locator('#logo')).toHaveText('Office');

  const firstRow = page.locator('.b-ent').first();
  await expectNoHorizontalOverlap(firstRow.locator('.board-nuser'), firstRow.locator('.board-class'));

  await page.screenshot({ path: testInfo.outputPath('hotboards-office.png'), fullPage: true });
  await page.close();
});

test('applies Office theme to board directory pages', async ({}, testInfo) => {
  const page = await openThemedPage('https://www.ptt.cc/bbs/index.html');

  await expectLightSurface(page.locator('.b-list-container'));
  await expect(page.locator('#logo')).toHaveText('Office');
  await expectReadableText(page.locator('#logo'));
  await expect(page.locator('.b-ent').first()).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath('bbs-index-office.png'), fullPage: true });
  await page.close();
});

test('applies Office theme to category pages', async ({}, testInfo) => {
  const page = await openThemedPage('https://www.ptt.cc/cls/3652');

  await expectLightSurface(page.locator('.b-list-container'));
  await expect(page.locator('.b-ent').first()).toBeVisible();
  await expect(page.locator('#logo')).toHaveText('Office');

  await page.screenshot({ path: testInfo.outputPath('cls-3652-office.png'), fullPage: true });
  await page.close();
});

test('applies Office theme to board article lists', async ({}, testInfo) => {
  const page = await openThemedPage('https://www.ptt.cc/bbs/Soft_Job/index.html');

  await expectLightSurface(page.locator('.r-list-container'));
  await expect(page.locator('#logo')).toHaveText('Office');
  await expectReadableText(page.locator('#logo'));

  const firstRow = page.locator('.r-ent:has(.title a)').first();
  await expectStackedAbove(page.locator('#action-bar-container'), page.locator('.search-bar .query'));
  await expectStackedAbove(page.locator('.search-bar .query'), firstRow);
  await expect(firstRow).toBeVisible();
  await expect(firstRow.locator('.title')).toBeVisible();
  await expect(firstRow.locator('.meta')).toBeVisible();
  await expectContainedHorizontally(firstRow.locator('.title'), firstRow);

  await page.screenshot({ path: testInfo.outputPath('soft-job-index-office.png'), fullPage: true });
  await page.close();
});

test('applies Office theme to article pages', async ({}, testInfo) => {
  const page = await openThemedPage('https://www.ptt.cc/bbs/Soft_Job/M.1749789764.A.83F.html');

  await expectLightSurface(page.locator('#main-content'));
  await expect(page.locator('#logo')).toHaveText('Office');
  await expectReadableText(page.locator('#logo'));
  await expect(page.locator('.article-metaline').first()).toBeVisible();
  await expect(page.locator('.article-meta-tag').first()).toBeVisible();
  await expect(page.locator('.article-meta-value').first()).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath('soft-job-article-office.png') });
  await page.close();
});

test('applies Office theme to age confirmation pages', async ({}, testInfo) => {
  const page = await openThemedPage('https://www.ptt.cc/ask/over18?from=%2Fbbs%2FGossiping%2Findex.html');

  await expectLightSurface(page.locator('.over18-notice'));
  await expect(page.locator('.btn-big').first()).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath('over18-office.png'), fullPage: true });
  await page.close();
});
