const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 393, height: 852 } // iPhone 14 尺寸
  });
  
  const errors = [];
  const logs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push('[CONSOLE] ' + text);
    }
    logs.push(text);
  });
  
  page.on('pageerror', err => {
    errors.push('[PAGE ERROR] ' + err.message);
  });
  
  page.on('requestfailed', req => {
    errors.push('[NETWORK] ' + req.url() + ' - ' + req.failure().errorText);
  });
  
  console.log('=== 1. Loading page and animation test ===');
  await page.goto('file:///D:/迅雷下载/2026-05-18-task-1/life-checkin/index.html');
  
  // 截图载入动画各阶段
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_phase1.png' });
  console.log('Phase 1 screenshot taken');
  
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test_phase2.png' });
  console.log('Phase 2 screenshot taken');
  
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test_phase3.png' });
  console.log('Phase 3 screenshot taken');
  
  await page.waitForTimeout(3500);
  console.log('Loading animation should be complete');
  
  // 检查载入屏幕是否隐藏
  const loadingHidden = await page.evaluate(() => {
    const screen = document.getElementById('loadingScreen');
    return screen ? window.getComputedStyle(screen).display === 'none' : true;
  });
  console.log('Loading screen hidden:', loadingHidden);
  
  await page.screenshot({ path: 'test_main_page.png' });
  console.log('Main page screenshot taken');
  
  console.log('\n=== 2. Theme toggle test ===');
  await page.click('.theme-toggle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_dark_theme.png' });
  console.log('Dark theme screenshot taken');
  
  await page.click('.theme-toggle');
  await page.waitForTimeout(500);
  console.log('Switched back to light theme');
  
  console.log('\n=== 3. Tab switching test ===');
  await page.click('#tabTimeline');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_timeline_tab.png' });
  console.log('Timeline tab screenshot taken');
  
  await page.click('#tabStats');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_stats_tab.png' });
  console.log('Stats tab screenshot taken');
  
  await page.click('#tabList');
  await page.waitForTimeout(500);
  console.log('Switched back to list tab');
  
  console.log('\n=== 4. Search test ===');
  await page.click('.search-input');
  await page.type('.search-input', '测试');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_search.png' });
  console.log('Search screenshot taken');
  
  // 清空搜索
  await page.evaluate(() => { document.querySelector('.search-input').value = ''; });
  await page.waitForTimeout(300);
  
  console.log('\n=== 5. Check-in modal test ===');
  // 点击第一个打卡按钮
  const checkinBtns = await page.$$('.event-checkin-btn');
  if (checkinBtns.length > 0) {
    await checkinBtns[0].click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test_checkin_modal.png' });
    console.log('Check-in modal screenshot taken');
    
    // 关闭弹窗
    await page.click('.modal-overlay');
    await page.waitForTimeout(300);
  } else {
    console.log('No check-in buttons found');
  }
  
  console.log('\n=== 6. Data panel test ===');
  await page.click('#tabData');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_data_panel.png' });
  console.log('Data panel screenshot taken');
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('Total errors:', errors.length);
  if (errors.length > 0) {
    console.log('\nAll errors:');
    errors.forEach(e => console.log(' -', e));
  } else {
    console.log('✅ No errors found!');
  }
  
  await browser.close();
})();
