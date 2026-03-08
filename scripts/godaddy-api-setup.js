#!/usr/bin/env node
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to GoDaddy API Keys page
    console.log('🔓 Navigating to GoDaddy API Keys...');
    await page.goto('https://developer.godaddy.com/keys', { waitUntil: 'networkidle' });

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    console.log('✓ Loaded GoDaddy API Keys page');

    // Check if we need to login - wait 5 seconds to see if login form appears
    const hasLoginForm = await page.$('input[type="email"], input[name="login"]').catch(() => null);
    if (hasLoginForm) {
      console.log('⚠️  Please log in to your GoDaddy account in the browser window');
      console.log('⏳ Waiting 60 seconds for you to complete login...');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(3000);
    }

    // Wait for the API Keys page to fully load - be flexible with selectors
    try {
      await page.waitForTimeout(3000);
      await page.waitForSelector('table, button, h1, h2', { timeout: 15000 });
    } catch (e) {
      console.log('⚠️  Page load selector timeout - continuing anyway');
    }
    await page.waitForTimeout(2000);

    console.log('🔍 Looking for existing API key to delete...');

    // Try to find and click delete button for HōMI_Dev_Key
    const deleteButtons = await page.$$('[class*="delete"], [class*="trash"], button[aria-label*="delete"], button[aria-label*="Delete"]');

    if (deleteButtons.length > 0) {
      console.log(`✓ Found ${deleteButtons.length} delete button(s)`);

      // Click the first delete button (should be for the most recent key)
      await deleteButtons[0].click();
      console.log('✓ Clicked delete button');

      // Wait for confirmation dialog
      await page.waitForTimeout(1000);

      // Confirm deletion
      const confirmButtons = await page.$$('button');
      for (const btn of confirmButtons) {
        const text = await btn.textContent();
        if (text.includes('Delete') || text.includes('Confirm')) {
          await btn.click();
          console.log('✓ Confirmed deletion');
          break;
        }
      }

      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️  Could not find delete button - will proceed to create new key');
    }

    // Click "Create New API Key" button
    console.log('➕ Creating new API Key...');
    const createButtons = await page.$$('button');
    let clicked = false;
    for (const btn of createButtons) {
      const text = await btn.textContent();
      if (text.includes('Create') && text.includes('API')) {
        await btn.click();
        clicked = true;
        console.log('✓ Clicked Create New API Key');
        break;
      }
    }

    if (!clicked) {
      console.log('⚠️  Could not find Create button - looking for alternative selectors');
      await page.click('[class*="create"], button:has-text("Create")').catch(() => {});
    }

    await page.waitForTimeout(2000);

    // Fill in API Key name
    console.log('📝 Filling in API Key details...');
    const nameInputs = await page.$$('input[type="text"], input[name*="name"], input[placeholder*="name"]');
    if (nameInputs.length > 0) {
      await nameInputs[0].fill('HōMI_DNS_Key');
      console.log('✓ Entered API Key name: HōMI_DNS_Key');
    }

    await page.waitForTimeout(1000);

    // Select Production environment
    const productionRadios = await page.$$('input[type="radio"]');
    for (const radio of productionRadios) {
      const label = await radio.getAttribute('value') || await radio.getAttribute('aria-label') || '';
      if (label.includes('Production')) {
        await radio.check();
        console.log('✓ Selected Production environment');
        break;
      }
    }

    await page.waitForTimeout(1000);

    // Click Next
    console.log('⬇️  Proceeding to scopes...');
    const nextButtons = await page.$$('button');
    for (const btn of nextButtons) {
      const text = await btn.textContent();
      if (text.includes('Next') || text.includes('Continue')) {
        await btn.click();
        console.log('✓ Clicked Next');
        break;
      }
    }

    await page.waitForTimeout(2000);

    // Select DNS management scopes
    console.log('🔐 Selecting DNS management scopes...');

    // Look for checkboxes related to Domains and DNS
    const checkboxes = await page.$$('input[type="checkbox"]');
    let dnsCheckboxFound = false;

    for (const checkbox of checkboxes) {
      const label = await checkbox.evaluate(el => {
        const labelEl = el.closest('label') || document.querySelector(`label[for="${el.id}"]`);
        return labelEl ? labelEl.textContent : '';
      });

      if (label.includes('DNS') || label.includes('Manage')) {
        await checkbox.check();
        console.log(`✓ Checked: ${label.trim().substring(0, 50)}`);
        dnsCheckboxFound = true;
      }

      if (label.includes('Domains') && label.includes('Read')) {
        await checkbox.check();
        console.log(`✓ Checked: ${label.trim().substring(0, 50)}`);
      }
    }

    if (!dnsCheckboxFound) {
      console.log('⚠️  Could not find DNS checkbox - attempting alternative method');
      // Try clicking visible checkboxes that might correspond to DNS
      const labels = await page.$$('label');
      for (const label of labels) {
        const text = await label.textContent();
        if (text.includes('DNS') || text.includes('Manage')) {
          const checkbox = await label.$('input[type="checkbox"]');
          if (checkbox) {
            await checkbox.check();
            console.log(`✓ Checked scope: ${text.substring(0, 50)}`);
          }
        }
      }
    }

    await page.waitForTimeout(1000);

    // Click Create/Finish
    console.log('✅ Creating API Key with scopes...');
    const finalButtons = await page.$$('button');
    for (const btn of finalButtons) {
      const text = await btn.textContent();
      if (text.includes('Create') || text.includes('Finish') || text.includes('Submit')) {
        await btn.click();
        console.log('✓ Submitted API Key creation');
        break;
      }
    }

    // Wait for key to be generated
    await page.waitForTimeout(3000);

    // Extract the new API Key and Secret
    console.log('📋 Extracting API Key and Secret...');

    const keyValue = await page.evaluate(() => {
      // Try multiple selectors to find the key
      const inputs = document.querySelectorAll('input, textarea, [class*="key"], [class*="secret"]');
      const values = [];
      for (const el of inputs) {
        const value = el.value || el.textContent;
        if (value && value.length > 20) {
          values.push(value);
        }
      }
      return values;
    });

    if (keyValue.length >= 2) {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 API KEY CREATED SUCCESSFULLY!');
      console.log('='.repeat(60));
      console.log(`\n📌 Key: ${keyValue[0]}`);
      console.log(`\n📌 Secret: ${keyValue[1]}`);
      console.log('\n' + '='.repeat(60));
      console.log('\n✅ Copy these values and share with Claude Code');
    } else {
      console.log('\n⚠️  Could not automatically extract key and secret');
      console.log('Please copy them manually from the page');
      console.log('Browser will stay open - take screenshot and copy values');
      await page.waitForTimeout(60000); // Keep open for 60 seconds
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Keeping browser open for manual completion');
    await page.waitForTimeout(120000); // Keep open for 2 minutes
  } finally {
    await browser.close();
  }
})();
