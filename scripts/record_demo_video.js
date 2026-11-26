const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function recordDemo() {
  console.log('Starting BreatheWise high-definition demo video recording...');
  const videoDir = path.join(__dirname, '../public/demo-video');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  // Helper wait
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    // SCENE 1: LANDING HERO & DATA PANEL
    console.log('Scene 1: Loading Landing Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await wait(2500);

    // Subtle scroll down to view live data panel
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await wait(2500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await wait(1500);

    // SCENE 2: INTERACTIVE 4-STEP ONBOARDING
    console.log('Scene 2: Opening Onboarding Wizard...');
    // Click 1-Minute Setup button if available, or location badge
    const setupBtn = await page.$('button:has-text("1-MINUTE SETUP")');
    if (setupBtn) {
      await setupBtn.click();
    } else {
      await page.click('header button:has(svg)');
    }
    await wait(1800);

    // Step 1: Select City (New Delhi or Hyderabad)
    const cityBtn = await page.$('button:has-text("New Delhi")');
    if (cityBtn) await cityBtn.click();
    await wait(1200);
    await page.click('button:has-text("CONTINUE")');
    await wait(1500);

    // Step 2: Household (toggle children, elderly, asthma)
    const childBox = await page.$('div:has-text("Children in Home?")');
    if (childBox) await childBox.click();
    await wait(800);
    const seniorBox = await page.$('div:has-text("Elderly Family Members?")');
    if (seniorBox) await seniorBox.click();
    await wait(800);
    const asthmaBox = await page.$('div:has-text("Respiratory Sensitivity?")');
    if (asthmaBox) await asthmaBox.click();
    await wait(1200);
    await page.click('button:has-text("CONTINUE")');
    await wait(1500);

    // Step 3: Lifestyle (Metro & Children Priority)
    const metroBtn = await page.$('button:has-text("Metro / Rail")');
    if (metroBtn) await metroBtn.click();
    await wait(800);
    const priorityBtn = await page.$('button:has-text("Protecting Children")');
    if (priorityBtn) await priorityBtn.click();
    await wait(1200);
    await page.click('button:has-text("CONTINUE")');
    await wait(1500);

    // Step 4: Budget (Free only)
    const freeBtn = await page.$('button:has-text("₹0 — Free Only")');
    if (freeBtn) await freeBtn.click();
    await wait(1200);
    await page.click('button:has-text("SAVE & SEE MY PLAN")');
    await wait(2500);

    // SCENE 3: AIR INTELLIGENCE DASHBOARD
    console.log('Scene 3: Exploring Air Intelligence Dashboard...');
    await page.click('nav button:has-text("TODAY")');
    await wait(2500);

    // Scroll to inspect 24-hr Diurnal Area Chart
    await page.evaluate(() => window.scrollBy({ top: 550, behavior: 'smooth' }));
    await wait(2500);

    // Toggle chart view to PM2.5
    const pm25Tab = await page.$('button:has-text("PM2.5")');
    if (pm25Tab) {
      await pm25Tab.click();
      await wait(2000);
    }
    const aqiTab = await page.$('button:has-text("US AQI")');
    if (aqiTab) {
      await aqiTab.click();
      await wait(1500);
    }

    // Scroll down to Daily Outlook
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await wait(2500);

    // SCENE 4: AI DAILY ACTION PLANNER
    console.log('Scene 4: AI Daily Action Planner...');
    await page.click('nav button:has-text("YOUR ROUTINE")');
    await wait(2500);

    // Toggle Morning / Midday / Evening tabs
    const morningTab = await page.$('button:has-text("MORNING")');
    if (morningTab) {
      await morningTab.click();
      await wait(1800);
    }
    const allTab = await page.$('button:has-text("ALL DAY")');
    if (allTab) {
      await allTab.click();
      await wait(1500);
    }

    // Click DO THIS on first recommendation to demonstrate interactive completion
    const doThisBtns = await page.$$('button:has-text("DO THIS")');
    if (doThisBtns.length > 0) {
      await doThisBtns[0].click();
      await wait(1500);
    }
    if (doThisBtns.length > 1) {
      await doThisBtns[1].click();
      await wait(1500);
    }

    // SCENE 5: SMART OUTDOOR ACTIVITY WINDOW
    console.log('Scene 5: Smart Outdoor Activity Window...');
    await page.evaluate(() => window.scrollBy({ top: 750, behavior: 'smooth' }));
    await wait(2000);

    // Click on 2 PM window
    const hourBtns = await page.$$('button:has-text("BETTER"), button:has-text("CAUTION"), button:has-text("LIMIT")');
    if (hourBtns.length > 5) {
      await hourBtns[3].click();
      await wait(1500);
      await hourBtns[6].click();
      await wait(1500);
    }

    // Scroll to Indoor Workout Alternatives
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await wait(2500);

    // SCENE 6: CLEAN AIR HOME LAB & IMPACT
    console.log('Scene 6: Clean Air Home Lab & Impact Dashboard...');
    await page.click('nav button:has-text("CLEANER LIVING")');
    await wait(2500);

    // Toggle indoor checklist habits
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await wait(2000);
    const habitCards = await page.$$('div:has-text("Check outdoor AQI"), div:has-text("Use continuous exhaust"), div:has-text("Wet dusting")');
    if (habitCards.length > 0) {
      await habitCards[0].click();
      await wait(1200);
    }

    // Scroll to Impact Tracker 3-Tier Policy
    await page.evaluate(() => window.scrollBy({ top: 650, behavior: 'smooth' }));
    await wait(3000);

    // SCENE 7: COMMUNITY NETWORK
    console.log('Scene 7: Community Network...');
    await page.click('nav button:has-text("COMMUNITY")');
    await wait(2500);
    const commitBtns = await page.$$('button:has-text("COMMIT")');
    if (commitBtns.length > 0) {
      await commitBtns[0].click();
      await wait(1500);
    }

    // SCENE 8: ASK BREATHEWISE AI CHAT
    console.log('Scene 8: Ask BreatheWise AI Assistant...');
    await page.click('nav button:has-text("ASK AI")');
    await wait(2500);

    // Click quick prompt chip
    const chip = await page.$('button:has-text("Should I open the windows right now?")');
    if (chip) {
      await chip.click();
      console.log('Waiting for AI response...');
      await wait(5000);
    }

    // Scroll down to show medical notice and full conversation
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await wait(3000);

    // Back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await wait(2000);

    console.log('Demo recording script finished successfully!');
  } catch (err) {
    console.error('Error during recording:', err);
  } finally {
    // Close context to ensure video is completely encoded and saved
    await page.close();
    await context.close();
    await browser.close();
  }

  // Find generated video file
  const files = fs.readdirSync(videoDir);
  const webmFile = files.find(f => f.endsWith('.webm'));
  if (webmFile) {
    const srcPath = path.join(videoDir, webmFile);
    const destPath = path.join(__dirname, '../public/breathewise-demo.webm');
    fs.copyFileSync(srcPath, destPath);
    console.log(`Video saved to: ${destPath}`);
  }
}

recordDemo().catch(console.error);
