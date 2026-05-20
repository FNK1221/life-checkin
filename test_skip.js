const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('file:///D:/迅雷下载/2026-05-18-task-1/life-checkin/index.html');
  await page.waitForTimeout(500);
  const skipBtn = await page.$('#skipLoadingBtn');
  console.log('Skip button exists:', skipBtn !== null);
  if (skipBtn) {
    await skipBtn.click();
    await page.waitForTimeout(1000);
    const loadingVisible = await page.evaluate(() => {
      const s = document.getElementById('loadingScreen');
      return s ? window.getComputedStyle(s).display !== 'none' : true;
    });
    console.log('Loading hidden after skip:', loadingVisible === false);
  }
  console.log('Errors:', errors.length);
  await browser.close();
})();
