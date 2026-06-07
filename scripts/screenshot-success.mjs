import { chromium } from 'playwright';

const VIEWPORT = { width: 375, height: 812 };
const BASE_URL = 'http://localhost:9528';
const OUT_DIR = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/images';

// 10 scenarios from DemoPreview.vue
const SCENARIO_LABELS = [
  '纯预存款全覆盖',
  '纯游戏币全覆盖',
  '预存款+游戏币全覆盖',
  '预存款不足→外付补差',
  '游戏币不足→外付补差',
  '预存款+币均不足→补差',
  '优惠券+折扣+全额覆盖',
  '优惠券+折扣+不足→补差',
  '仅游戏币·充足',
  '仅游戏币·不足→补差',
];

function sanitize(name) {
  return name.replace(/[→·]/g, '_').replace(/\s+/g, '');
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await context.newPage();

  console.log('🌐 Opening page...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  for (let i = 0; i < SCENARIO_LABELS.length; i++) {
    const label = SCENARIO_LABELS[i];
    const filename = `success-${String(i + 1).padStart(2, '0')}-${sanitize(label)}.png`;
    console.log(`\n📸 [${i + 1}/10] ${label}`);

    // 1. Click scenario button under "付款结算" page group (in phone mode)
    const scenarioBtn = page.locator('.demo-scenario-btn', { hasText: label }).first();
    await scenarioBtn.click();
    await page.waitForTimeout(600);

    // 2. Switch to full screen mode
    const fullScreenBtn = page.locator('.demo-btn--mode', { hasText: '小程序全屏' });
    await fullScreenBtn.click();
    await page.waitForTimeout(600);

    // 3. Click "确认并支付" / "确认扣款" button
    const confirmBtn = page.locator('button.mp-btn-pay').first();
    const btnText = await confirmBtn.textContent();
    console.log(`   → 点击: ${btnText?.trim()}`);
    await confirmBtn.click();

    // 4. Wait for success — MiniPayFlow transition: 400ms→processing + 2500ms→success
    await page.waitForSelector('.mp-result-title', { timeout: 10000 });
    await page.waitForTimeout(400); // let animations settle

    // 5. Take screenshot of viewport (375x812, full screen MiniPayFlow)
    await page.screenshot({ path: `${OUT_DIR}/${filename}`, fullPage: false });
    console.log(`   ✅ Saved: ${filename}`);

    // 6. Click "完成" to go back
    const doneBtn = page.locator('button', { hasText: '完成' });
    await doneBtn.click();
    await page.waitForTimeout(700);

    // 7. Switch back to phone mode (show nav bar again)
    const phoneModeBtn = page.locator('.demo-btn--mode', { hasText: '手机预览' });
    await phoneModeBtn.click();
    await page.waitForTimeout(600);
  }

  console.log('\n🎉 All 10 screenshots done!');
  await browser.close();
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
