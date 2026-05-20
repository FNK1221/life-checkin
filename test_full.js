const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const logs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.log('ERROR:', text);
    } else {
      logs.push(text);
      if (text.includes('[audio]')) console.log('LOG:', text);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('PAGE ERROR:', err.message);
  });
  
  console.log('Opening page...');
  await page.goto('file:///D:/迅雷下载/2026-05-18-task-1/life-checkin/index.html');
  
  // 等待加载动画完成（约8秒）
  console.log('Waiting for loading animation...');
  await page.waitForTimeout(8500);
  
  console.log('Taking screenshot after loading...');
  await page.screenshot({ path: 'test_after_load.png' });
  
  // 检查 loading screen 是否隐藏
  const loadingVisible = await page.evaluate(() => {
    const screen = document.getElementById('loadingScreen');
    return screen ? window.getComputedStyle(screen).display !== 'none' : false;
  });
  
  console.log('\n=== TEST RESULTS ===');
  console.log('Loading screen still visible:', loadingVisible);
  console.log('Console errors count:', errors.length);
  console.log('Audio-related logs:', logs.filter(l => l.includes('[audio]')));
  
  if (errors.length > 0) {
    console.log('\nAll errors:');
    errors.forEach(e => console.log(' -', e));
  }
  
  await browser.close();
})();
