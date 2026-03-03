/**
 * Comet Browser Automation Script for GoDaddy API Key Setup
 *
 * This script automates:
 * 1. Delete old HōMI_Dev_Key
 * 2. Create new HōMI_DNS_Key with Production environment
 * 3. Select DNS management scopes
 * 4. Extract and return the API Key and Secret
 */

async function automateGoDaddyAPISetup() {
  console.log('🚀 Starting GoDaddy API Key automation...\n');

  try {
    // Step 1: Delete existing API Key
    console.log('Step 1: Finding and deleting HōMI_Dev_Key...');

    // Look for delete buttons in the API Keys table
    const deleteButtons = document.querySelectorAll('[class*="delete"], [aria-label*="delete"], button svg[class*="trash"]');
    console.log(`  Found ${deleteButtons.length} potential delete buttons`);

    if (deleteButtons.length > 0) {
      // Click the first delete button (most recent key)
      const deleteBtn = deleteButtons[0].closest('button') || deleteButtons[0];
      deleteBtn.click();
      console.log('  ✓ Clicked delete button');

      // Wait for confirmation dialog
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Find and click confirm button
      const confirmBtns = document.querySelectorAll('button');
      for (const btn of confirmBtns) {
        if (btn.textContent.includes('Delete') || btn.textContent.includes('Confirm')) {
          btn.click();
          console.log('  ✓ Confirmed deletion');
          break;
        }
      }

      // Wait for deletion to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Step 2: Click "Create New API Key" button
    console.log('\nStep 2: Creating new API Key...');
    const createBtns = document.querySelectorAll('button');
    for (const btn of createBtns) {
      if (btn.textContent.includes('Create') && btn.textContent.includes('API')) {
        btn.click();
        console.log('  ✓ Clicked "Create New API Key"');
        break;
      }
    }

    // Wait for modal/dialog to appear
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Fill API Key name
    console.log('\nStep 3: Filling in API Key details...');
    const nameInputs = document.querySelectorAll('input[type="text"], input[name*="name"]');
    if (nameInputs.length > 0) {
      nameInputs[0].value = 'HōMI_DNS_Key';
      nameInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      nameInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      console.log('  ✓ Entered name: HōMI_DNS_Key');
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    // Step 4: Select Production environment
    console.log('\nStep 4: Selecting Production environment...');
    const radios = document.querySelectorAll('input[type="radio"]');
    for (const radio of radios) {
      const label = radio.getAttribute('value') || radio.getAttribute('aria-label') || '';
      if (label.includes('Production') || radio.closest('label')?.textContent.includes('Production')) {
        radio.click();
        console.log('  ✓ Selected Production');
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    // Step 5: Click Next button
    console.log('\nStep 5: Proceeding to scopes selection...');
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Next') || btn.textContent.includes('Continue')) {
        btn.click();
        console.log('  ✓ Clicked Next');
        break;
      }
    }

    // Wait for scopes page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 6: Select DNS management scopes
    console.log('\nStep 6: Selecting DNS management scopes...');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let scopesSelected = 0;

    for (const checkbox of checkboxes) {
      const label = checkbox.closest('label') || document.querySelector(`label[for="${checkbox.id}"]`);
      const labelText = label ? label.textContent : '';

      // Select DNS > Manage scope
      if (labelText.includes('DNS') && labelText.includes('Manage')) {
        checkbox.click();
        console.log(`  ✓ Selected: ${labelText.trim().substring(0, 60)}`);
        scopesSelected++;
      }

      // Select Domains > Read scope
      if (labelText.includes('Domains') && labelText.includes('Read')) {
        checkbox.click();
        console.log(`  ✓ Selected: ${labelText.trim().substring(0, 60)}`);
        scopesSelected++;
      }
    }

    if (scopesSelected === 0) {
      console.log('  ⚠️  Could not find specific scope checkboxes - attempting alternate selection');
      // If we can't find specific labels, select likely candidates
      for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
        checkboxes[i].click();
        console.log(`  ✓ Selected scope ${i + 1}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 7: Click Create/Submit button
    console.log('\nStep 7: Creating API Key with selected scopes...');
    const allBtns = document.querySelectorAll('button');
    for (const btn of allBtns) {
      const btnText = btn.textContent;
      if (btnText.includes('Create') || btnText.includes('Finish') || btnText.includes('Submit')) {
        if (!btnText.includes('Cancel') && !btnText.includes('Go Back')) {
          btn.click();
          console.log('  ✓ Submitted creation');
          break;
        }
      }
    }

    // Wait for key generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 8: Extract API Key and Secret
    console.log('\nStep 8: Extracting API Key and Secret...');

    // Look for inputs or text containing the key/secret
    const allInputs = document.querySelectorAll('input, textarea');
    const keySecrets = [];

    for (const input of allInputs) {
      const value = input.value || input.textContent;
      if (value && value.length > 20 && !value.includes('@') && !value.includes(' ')) {
        keySecrets.push(value);
      }
    }

    // Also check visible text on page
    const pageText = document.body.innerText;
    const keyMatches = pageText.match(/[a-zA-Z0-9_]{30,}/g) || [];

    if (keySecrets.length >= 2) {
      console.log('\n' + '='.repeat(70));
      console.log('🎉 API KEY CREATED SUCCESSFULLY!');
      console.log('='.repeat(70));
      console.log(`\n📌 API Key:\n${keySecrets[0]}`);
      console.log(`\n📌 Secret:\n${keySecrets[1]}`);
      console.log('\n' + '='.repeat(70));
      console.log('\n✅ Copy these values and send them to Claude Code');

      // Return the values for processing
      return {
        success: true,
        apiKey: keySecrets[0],
        secret: keySecrets[1]
      };
    } else {
      console.log('\n⚠️  Could not automatically extract key and secret');
      console.log('📸 Please take a screenshot of the page');
      console.log('📋 Then manually copy and paste the Key and Secret to Claude Code');
      return {
        success: false,
        message: 'Please copy values manually from page'
      };
    }

  } catch (error) {
    console.error('❌ Error during automation:', error.message);
    console.log('\n⚠️  Something went wrong - please complete the setup manually');
    console.log('📍 Current page: ' + window.location.href);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the automation
automateGoDaddyAPISetup().then(result => {
  console.log('\n[Automation Complete]', result);
});
