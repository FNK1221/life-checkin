const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('ERROR:', msg.text());
    }
  });
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('PAGE ERROR:', err.message);
  });
  
  await page.goto('file:///D:/迅雷下载/2026-05-18-task-1/life-checkin/index.html');
  await page.waitForTimeout(9000); // 等待加载完成
  
  // 测试1：点击搜索框
  console.log('Testing search input...');
  await page.click('.search-input');
  await page.waitForTimeout(500);
  
  // 测试2：点击底部导航（时光轴）
  console.log('Testing timeline tab...');
  await page.click('#tabTimeline');
  await page.waitForTimeout(500);
  
  // 测试3：点击底部导航（统计）
  console.log('Testing stats tab...');
  await page.click('#tabStats');
  await page.waitForTimeout(500);
  
  // 测试4：点击底部导航（数据）
  console.log('Testing data tab...');
  await page.click('#tabData');
  await page.waitForTimeout(500);
  
  // 截图
  await page.screenshot({ path: 'test_interact.png' });
  
  console.log('\n=== INTERACTION TEST RESULTS ===');
  console.log('Errors count:', errors.length);
  if (errors.length === 0) {
    console.log('✅ All interactions passed without errors!');
  } else {
    errors.forEach(e => console.log(' -', e));
  }
  
  await browser.close();
})();
