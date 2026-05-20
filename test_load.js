const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Opening page...');
  await page.goto('file:///D:/迅雷下载/2026-05-18-task-1/life-checkin/index.html');
  
  // 等待页面加载
  await page.waitForTimeout(500);
  console.log('Taking screenshot at 0.5s...');
  await page.screenshot({ path: 'test_0.5s_new.png' });
  
  await page.waitForTimeout(1500);
  console.log('Taking screenshot at 2s...');
  await page.screenshot({ path: 'test_2s_new.png' });
  
  await page.waitForTimeout(3000);
  console.log('Taking screenshot at 5s...');
  await page.screenshot({ path: 'test_5s_new.png' });
  
  // 检查控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  
  await page.waitForTimeout(3000);
  console.log('Test complete.');
  await browser.close();
})();
