const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  
  await page.goto('file:///D:/迅雷下载/2026-05-18-task-1/life-checkin/index.html');
  await page.waitForTimeout(500);
  console.log('Phase 1 screenshot taken');
  
  await page.waitForTimeout(3000);
  const loadingVisible = await page.evaluate(() => {
    const screen = document.getElementById('loadingScreen');
    return screen ? window.getComputedStyle(screen).display !== 'none' : true;
  });
  console.log('Loading screen hidden after 3.5s:', loadingVisible === false);
  console.log('Errors:', errors.length);
  
  await browser.close();
})();
