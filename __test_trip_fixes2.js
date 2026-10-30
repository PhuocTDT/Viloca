const { chromium } = require('playwright');
const SCRATCH = 'D:/app/claude/tmp/claude/d--Desktop-Viloca/9d07ccc4-922b-4919-997a-52ab9ff02d32/scratchpad';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text().slice(0, 200)); });

  await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Sign in', { timeout: 30000 }).catch(() => {});
  const inputs = await page.locator('input').all();
  if (inputs.length >= 2) {
    const email = process.env.VILOCA_TEST_EMAIL;
    const password = process.env.VILOCA_TEST_PASSWORD;
    if (!email || !password) throw new Error('Set VILOCA_TEST_EMAIL and VILOCA_TEST_PASSWORD before running this test.');
    await inputs[0].fill(email);
    await inputs[1].fill(password);
    await page.getByText('Sign in', { exact: true }).click();
  }
  await page.waitForSelector('text=Sen', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);

  console.log('--- Open trip 1 (Upcoming trip), scroll down ---');
  await page.getByText(/Upcoming trip/).click();
  await page.waitForTimeout(1500);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCRATCH}/trip1_scrolled.png` });

  console.log('--- Go back, open My trips, open Hà Nội cuối tuần (while trip 1 was left scrolled) ---');
  await page.goBack();
  await page.waitForTimeout(1000);
  await page.getByText('Trips', { exact: true }).click();
  await page.waitForTimeout(1500);
  await page.getByText('Hà Nội cuối tuần', { exact: true }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SCRATCH}/trip2_switched.png` });

  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR:', e.message); process.exit(1); });
