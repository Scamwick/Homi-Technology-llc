/**
 * GODADDY API KEY SETUP USING BROWSER AUTOMATION FRAMEWORK
 *
 * This script uses the BrowserAutomation class to:
 * 1. Delete existing API key (HōMI_Dev_Key)
 * 2. Create new API key with name HōMI_DNS_Key
 * 3. Set to Production environment
 * 4. Select DNS management scopes
 * 5. Extract and display the API key and secret
 */

async function automateGoDaddyAPIKeySetup() {
  // Create bot instance
  const bot = new BrowserAutomation({
    verbose: true,
    timeout: 30000,
    waitTime: 1500,
    retryAttempts: 3
  });

  try {
    console.log('\n🚀 STARTING GODADDY API KEY AUTOMATION\n');
    console.log('Goal: Create HōMI_DNS_Key with DNS management scopes\n');

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Delete existing API key
    // ═══════════════════════════════════════════════════════════════════════
    console.log('📍 STEP 1: Delete existing HōMI_Dev_Key');
    console.log('─'.repeat(70));

    // Try to find and click delete button
    const deleteButtons = bot.findElements('button[aria-label*="delete"], [class*="delete"] button, button svg[class*="trash"]');
    if (deleteButtons.length > 0) {
      bot.log(`Found ${deleteButtons.length} potential delete buttons`, 'info');

      // Click the first one (usually most recent)
      for (const btn of deleteButtons) {
        if (btn.offsetHeight > 0) { // Check if visible
          bot.log('Clicking first visible delete button', 'click');
          btn.click();
          await bot.wait(1500);
          break;
        }
      }

      // Confirm deletion
      const confirmBtn = bot.findByText('Delete', 'button');
      if (confirmBtn) {
        bot.log('Confirming deletion', 'click');
        confirmBtn.click();
        await bot.wait(2000);
      }
    } else {
      bot.log('No existing key to delete - proceeding to create new one', 'warning');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Click "Create New API Key" button
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📍 STEP 2: Click "Create New API Key"');
    console.log('─'.repeat(70));

    const createBtn = bot.findByText('Create New API Key', 'button');
    if (!createBtn) throw new Error('Cannot find "Create New API Key" button');

    bot.log('Clicking Create New API Key button', 'click');
    createBtn.click();
    await bot.wait(2000);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Fill in API Key name
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📍 STEP 3: Enter API Key name');
    console.log('─'.repeat(70));

    const nameInput = bot.waitForElement('input[type="text"], input[placeholder*="name"]', 10000)
      .catch(() => bot.findElements('input[type="text"]')[0]);

    if (nameInput) {
      await bot.type('input[type="text"]', 'HōMI_DNS_Key');
    } else {
      throw new Error('Cannot find name input field');
    }

    await bot.wait(800);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Select Production environment
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📍 STEP 4: Select Production environment');
    console.log('─'.repeat(70));

    try {
      await bot.checkRadioByText('Production');
    } catch (e) {
      bot.log('Using alternative method to select Production', 'warning');
      const productionRadios = bot.findElements('input[type="radio"]');
      for (const radio of productionRadios) {
        if (radio.value === 'Production' || radio.closest('label')?.textContent.includes('Production')) {
          radio.click();
          break;
        }
      }
    }

    await bot.wait(800);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Click "Next" button
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📍 STEP 5: Proceed to Scopes selection');
    console.log('─'.repeat(70));

    const nextBtn = bot.findByText('Next', 'button');
    if (!nextBtn) throw new Error('Cannot find "Next" button');

    bot.log('Clicking Next button', 'click');
    nextBtn.click();
    await bot.wait(2500);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 6: Select DNS management scopes
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📍 STEP 6: Select DNS management scopes');
    console.log('─'.repeat(70));

    const checkboxes = bot.findElements('input[type="checkbox"]');
    bot.log(`Found ${checkboxes.length} checkboxes on scopes page`, 'info');

    let dnsSelected = false;
    let domainsSelected = false;

    for (const checkbox of checkboxes) {
      const label = checkbox.closest('label') || document.querySelector(`label[for="${checkbox.id}"]`);
      const labelText = label ? label.textContent : '';

      // Select DNS > Manage
      if (labelText.includes('DNS') && labelText.includes('Manage') && !checkbox.checked) {
        checkbox.click();
        bot.log(`✓ Selected: ${labelText.trim().substring(0, 70)}`, 'success');
        dnsSelected = true;
        await bot.wait(300);
      }

      // Select Domains > Read
      if (labelText.includes('Domains') && labelText.includes('Read') && !checkbox.checked) {
        checkbox.click();
        bot.log(`✓ Selected: ${labelText.trim().substring(0, 70)}`, 'success');
        domainsSelected = true;
        await bot.wait(300);
      }
    }

    if (!dnsSelected) {
      bot.log('Warning: DNS > Manage scope not found - checking alternative selectors', 'warning');
      // Fallback: select first 2-3 checkboxes
      for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
        if (!checkboxes[i].checked) {
          checkboxes[i].click();
          await bot.wait(300);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 7: Click "Create" button
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📍 STEP 7: Create API Key with scopes');
    console.log('─'.repeat(70));

    const createFinalBtn = bot.findByText('Create', 'button');
    if (!createFinalBtn) throw new Error('Cannot find Create button');

    bot.log('Clicking Create button', 'click');
    createFinalBtn.click();
    await bot.wait(3500);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 8: Extract API Key and Secret
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📍 STEP 8: Extract API Key and Secret');
    console.log('─'.repeat(70));

    const allInputs = document.querySelectorAll('input[type="text"], textarea');
    let keyValue = null;
    let secretValue = null;

    for (const input of allInputs) {
      const value = input.value || input.textContent;
      if (value && value.length > 25 && !value.includes('@') && !value.includes(' ')) {
        // Likely an API key or secret
        if (!keyValue) {
          keyValue = value;
          bot.log(`Found Key: ${value.substring(0, 40)}...`, 'extract');
        } else if (!secretValue) {
          secretValue = value;
          bot.log(`Found Secret: ${value.substring(0, 40)}...`, 'extract');
          break;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RESULTS
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(70));
    console.log('🎉 API KEY CREATED SUCCESSFULLY!');
    console.log('═'.repeat(70));

    if (keyValue && secretValue) {
      console.log('\n📌 API KEY:');
      console.log(keyValue);
      console.log('\n📌 SECRET:');
      console.log(secretValue);
      console.log('\n✅ Copy both values and send them to Claude Code');
    } else {
      console.log('\n⚠️  Could not automatically extract values');
      console.log('📸 Please take a screenshot of the page');
      console.log('📋 Then manually copy Key and Secret');
    }

    console.log('\n' + '═'.repeat(70));
    bot.printSummary();

    return {
      success: !!keyValue && !!secretValue,
      apiKey: keyValue,
      secret: secretValue
    };

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n⚠️  Automation encountered an error');
    console.log('Please check the error message above');
    console.log('You may need to complete the setup manually');
    bot.printSummary();
    throw error;
  }
}

// Export for use
window.automateGoDaddyAPIKeySetup = automateGoDaddyAPIKeySetup;

console.log('✅ GoDaddy Automation loaded!');
console.log('Run: automateGoDaddyAPIKeySetup()');
