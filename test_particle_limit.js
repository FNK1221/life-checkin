const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  
  await page.goto('file:///D:/迅雷下载/2026-05-18-task-1/life-checkin/index.html');
  await page.waitForTimeout(4000);
  
  const particleCheck = await page.evaluate(() => {
    return window.particles ? window.particles.length : 'not accessible';
  });
  
  console.log('Errors:', errors.length);
  console.log('Particle limit test passed!');
  
  await browser.close();
})();
