// Opens each built example in Chromium and reports console errors and what rendered.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const dir = process.argv[2];
const only = process.argv[3];
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ proxy });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json')));
  let bad = 0;
  for (const ex of index) {
    if (only && ex.id !== only) continue;
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('%cDownload')) errors.push(m.text().slice(0, 300)); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 300)));
    await page.goto('file://' + path.resolve(dir, ex.file), { waitUntil: 'commit' });
    await page.waitForTimeout(Number(process.env.WAIT || 6000));
    if (ex.click) { try { await page.getByRole('button', { name: new RegExp(ex.click) }).first().click(); await page.waitForTimeout(800); } catch (e) { errors.push('click failed: ' + ex.click); } }
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim().slice(0, 200);
    const expectErr = ex.expect === 'error';
    const warnings = errors.filter((e) => e.startsWith('Warning:'));
    const real = errors.filter((e) => !e.startsWith('Warning:'));
    const ok = expectErr ? true : text.length > 0 && real.length === 0 && (ex.expect === 'warning' || warnings.length === 0);
    if (!ok) bad++;
    console.log(JSON.stringify({ id: ex.id, ok, text, errors: errors.slice(0, 3) }));
    await page.close();
  }
  await browser.close();
  console.log('failed:', bad);
})();
