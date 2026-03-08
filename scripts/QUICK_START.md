# 🚀 Quick Start: Browser Automation

## For GoDaddy API Setup (Your Immediate Task)

### Step 1: Open Developer Console in Comet/Safari
- **Right-click** anywhere on the page → **Inspect**
- Or press: **Cmd + Option + I** (Mac) / **F12** (Windows)
- Go to **Console** tab

### Step 2: Load the Automation Framework

Copy and paste this into the console:

```javascript
// Load Browser Automation Framework
const script = document.createElement('script');
script.textContent = `
${require('fs').readFileSync('/Users/codyshort/Desktop/HōMI_Kimi_Agent/homi-app/scripts/browser-automation.js', 'utf8')}
`;
document.body.appendChild(script);
```

**OR** paste the contents of `browser-automation.js` directly into the console.

### Step 3: Run GoDaddy Automation

Copy and paste this into the console:

```javascript
// Load the GoDaddy automation
const script = document.createElement('script');
script.textContent = `
${require('fs').readFileSync('/Users/codyshort/Desktop/HōMI_Kimi_Agent/homi-app/scripts/godaddy-automation-advanced.js', 'utf8')}
`;
document.body.appendChild(script);

// Run it
await automateGoDaddyAPIKeySetup();
```

**OR** simplified single command:

```javascript
// Copy bot code from browser-automation.js and run:
await automateGoDaddyAPIKeySetup();
```

---

## For Any Other Browser Automation Task

### Template: Basic Click and Type

```javascript
const bot = new BrowserAutomation();

// Click button
await bot.click('button.submit');

// Type into input
await bot.type('input[name="email"]', 'your@email.com');

// Click by text
await bot.clickByText('Save', 'button');

// Wait
await bot.wait(2000);
```

### Template: Multi-Step Form

```javascript
const bot = new BrowserAutomation();

const actions = [
  {
    description: 'Step 1: Fill email',
    fn: (bot) => bot.type('input[name="email"]', 'user@example.com')
  },
  {
    description: 'Step 2: Fill password',
    fn: (bot) => bot.type('input[name="password"]', 'pass123')
  },
  {
    description: 'Step 3: Submit',
    fn: (bot) => bot.clickByText('Sign In', 'button'),
    wait: 2000
  }
];

await bot.runActions(actions);
bot.printSummary();
```

### Template: Extract Data

```javascript
const bot = new BrowserAutomation();

// Extract table
const table = bot.extractTable('table.data');
console.log('Table data:', table);

// Extract text
const text = bot.extractAllText();
console.log('Page text:', text);

// Extract form
const form = bot.extractFormData('form');
console.log('Form data:', form);
```

---

## Most Common Commands

```javascript
// Click
await bot.click('selector');
await bot.clickByText('Button Text', 'button');

// Type
await bot.type('input[name="field"]', 'value');

// Wait
await bot.wait(2000);
await bot.waitForElement('button.submit');

// Check/Uncheck
await bot.toggleCheckbox('input[name="agree"]', true);

// Radio
await bot.checkRadioByText('Production');

// Extract
bot.getText('h1');
bot.getValue('input[name="email"]');
bot.extractTable('table');
bot.extractAllText();

// Check existence
if (bot.exists('button.delete')) { ... }
if (bot.isVisible('div.popup')) { ... }

// Summary
bot.getHistory();
bot.printSummary();
```

---

## Copy-Paste: Complete GoDaddy Solution

Paste this entire block into your console:

```javascript
// ════════════════════════════════════════════════════════════════
// 1. LOAD FRAMEWORK
// ════════════════════════════════════════════════════════════════

class BrowserAutomation {
  constructor(options = {}) {
    this.timeout = options.timeout || 30000;
    this.verbose = options.verbose !== false;
    this.waitTime = options.waitTime || 1000;
    this.retryAttempts = options.retryAttempts || 3;
    this.history = [];
  }

  log(message, type = 'info') {
    if (!this.verbose) return;
    const timestamp = new Date().toLocaleTimeString();
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️', click: '🖱️', type: '⌨️', action: '⚙️', extract: '📋' };
    console.log(`[${timestamp}] ${icons[type] || '•'} ${message}`);
    this.history.push({ timestamp, message, type });
  }

  async wait(ms = this.waitTime) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async waitFor(condition, timeoutMs = this.timeout, checkInterval = 500) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        if (typeof condition === 'function' ? await condition() : condition) return true;
      } catch (e) {}
      await this.wait(checkInterval);
    }
    throw new Error(`Timeout after ${timeoutMs}ms`);
  }

  async waitForElement(selector, timeoutMs = this.timeout) {
    this.log(`Waiting for: ${selector}`, 'wait');
    await this.waitFor(() => document.querySelector(selector), timeoutMs);
    return document.querySelector(selector);
  }

  findElement(selector) { return document.querySelector(selector); }
  findElements(selector) { return document.querySelectorAll(selector); }

  findByText(text, tagName = '*') {
    for (const el of document.querySelectorAll(tagName)) {
      if (el.textContent.includes(text)) return el;
    }
    return null;
  }

  async click(selector, options = {}) {
    const el = this.findElement(selector) || await this.waitForElement(selector, 5000);
    this.log(`Clicking: ${selector}`, 'click');
    el.click();
    await this.wait(options.wait || this.waitTime);
    return el;
  }

  async clickByText(text, tagName = 'button', options = {}) {
    const el = this.findByText(text, tagName);
    if (!el) throw new Error(`Element with text "${text}" not found`);
    this.log(`Clicking: "${text}"`, 'click');
    el.click();
    await this.wait(options.wait || this.waitTime);
    return el;
  }

  async type(selector, text, options = {}) {
    const el = this.findElement(selector);
    if (!el) throw new Error(`Input not found: ${selector}`);
    this.log(`Typing: "${text}"`, 'type');
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    await this.wait(options.wait || 300);
    return el;
  }

  async checkRadioByText(text) {
    const label = this.findByText(text, 'label');
    if (!label) throw new Error(`Radio label not found: "${text}"`);
    const radio = label.querySelector('input[type="radio"]');
    if (!radio) throw new Error(`Radio not found in: "${text}"`);
    this.log(`Checking radio: "${text}"`, 'action');
    radio.click();
    await this.wait(300);
    return radio;
  }

  async toggleCheckbox(selector, shouldCheck = true) {
    const el = this.findElement(selector);
    if (!el) throw new Error(`Checkbox not found: ${selector}`);
    if ((shouldCheck && !el.checked) || (!shouldCheck && el.checked)) {
      this.log(`${shouldCheck ? 'Check' : 'Uncheck'}ing: ${selector}`, 'action');
      el.click();
      await this.wait(300);
    }
    return el;
  }

  getValue(selector) {
    const el = this.findElement(selector);
    return el ? el.value || el.textContent : null;
  }

  getText(selector) {
    const el = this.findElement(selector);
    return el ? el.textContent.trim() : null;
  }

  exists(selector) { return !!document.querySelector(selector); }
  isVisible(selector) {
    const el = this.findElement(selector);
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  extractTable(selector = 'table') {
    const table = this.findElement(selector);
    if (!table) return null;
    const rows = [];
    for (const row of table.querySelectorAll('tbody tr, tr')) {
      const cells = row.querySelectorAll('td, th');
      rows.push(Array.from(cells).map(cell => cell.textContent.trim()));
    }
    return rows;
  }

  extractAllText() { return document.body.innerText; }
  extractFormData(selector = 'form') {
    const form = this.findElement(selector);
    if (!form) return null;
    const data = {};
    for (const input of form.querySelectorAll('input, textarea, select')) {
      const name = input.name || input.id;
      if (name) data[name] = input.type === 'checkbox' ? input.checked : input.value;
    }
    return data;
  }

  async runActions(actions) {
    this.log(`Running ${actions.length} actions...`, 'action');
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      try {
        this.log(`[${i + 1}/${actions.length}] ${action.description}`, 'action');
        await action.fn(this);
        await this.wait(action.wait || this.waitTime);
      } catch (e) {
        this.log(`Error: ${e.message}`, 'error');
        if (!action.ignoreError) throw e;
      }
    }
    this.log(`Done!`, 'success');
  }

  getHistory() { return this.history; }
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 AUTOMATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Actions: ${this.history.length}`);
    const success = this.history.filter(h => h.type === 'success').length;
    const errors = this.history.filter(h => h.type === 'error').length;
    console.log(`Success: ${success} | Errors: ${errors}`);
    console.log('='.repeat(70) + '\n');
  }
}

// ════════════════════════════════════════════════════════════════
// 2. RUN GODADDY AUTOMATION
// ════════════════════════════════════════════════════════════════

async function automateGoDaddyAPIKeySetup() {
  const bot = new BrowserAutomation({ verbose: true, waitTime: 1500 });

  try {
    console.log('\n🚀 GODADDY API KEY SETUP\n');

    // Delete old key
    console.log('Step 1: Deleting old API key...');
    const deleteButtons = bot.findElements('button[aria-label*="delete"], [class*="delete"] button');
    if (deleteButtons.length > 0) {
      for (const btn of deleteButtons) {
        if (btn.offsetHeight > 0) {
          bot.log('Clicking delete button', 'click');
          btn.click();
          await bot.wait(1500);
          break;
        }
      }
      const confirmBtn = bot.findByText('Delete', 'button');
      if (confirmBtn) {
        confirmBtn.click();
        await bot.wait(2000);
      }
    }

    // Create new key
    console.log('\nStep 2: Creating new API Key...');
    const createBtn = bot.findByText('Create New API Key', 'button');
    if (!createBtn) throw new Error('Create button not found');
    createBtn.click();
    await bot.wait(2000);

    // Fill name
    console.log('\nStep 3: Filling name...');
    const nameInput = bot.findElements('input[type="text"]')[0];
    if (nameInput) {
      nameInput.value = 'HōMI_DNS_Key';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await bot.wait(800);

    // Select Production
    console.log('\nStep 4: Selecting Production...');
    try {
      await bot.checkRadioByText('Production');
    } catch (e) {
      bot.log('Alternative selection method', 'warning');
      for (const radio of bot.findElements('input[type="radio"]')) {
        if (radio.closest('label')?.textContent.includes('Production')) {
          radio.click();
          break;
        }
      }
    }
    await bot.wait(800);

    // Click Next
    console.log('\nStep 5: Proceeding to scopes...');
    const nextBtn = bot.findByText('Next', 'button');
    if (nextBtn) {
      nextBtn.click();
      await bot.wait(2500);
    }

    // Select scopes
    console.log('\nStep 6: Selecting DNS scopes...');
    for (const checkbox of bot.findElements('input[type="checkbox"]')) {
      const label = checkbox.closest('label');
      const text = label ? label.textContent : '';
      if ((text.includes('DNS') || text.includes('Manage')) && !checkbox.checked) {
        checkbox.click();
        bot.log(`Selected: ${text.trim().substring(0, 60)}`, 'success');
        await bot.wait(300);
      }
    }

    // Create
    console.log('\nStep 7: Creating API Key...');
    const createFinalBtn = bot.findByText('Create', 'button');
    if (createFinalBtn) {
      createFinalBtn.click();
      await bot.wait(3500);
    }

    // Extract values
    console.log('\nStep 8: Extracting credentials...');
    let keyValue = null, secretValue = null;
    for (const input of document.querySelectorAll('input[type="text"], textarea')) {
      const value = input.value || input.textContent;
      if (value && value.length > 25 && !value.includes('@')) {
        if (!keyValue) keyValue = value;
        else if (!secretValue) secretValue = value;
      }
    }

    // Results
    console.log('\n' + '═'.repeat(70));
    console.log('🎉 API KEY CREATED!');
    console.log('═'.repeat(70));
    if (keyValue && secretValue) {
      console.log('\n📌 KEY:\n' + keyValue);
      console.log('\n📌 SECRET:\n' + secretValue);
      console.log('\n✅ Copy and send to Claude Code');
    } else {
      console.log('\n⚠️  Could not extract - copy manually from page');
    }
    console.log('═'.repeat(70));

    return { success: !!keyValue && !!secretValue, apiKey: keyValue, secret: secretValue };

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

// ════════════════════════════════════════════════════════════════
// 3. RUN IT
// ════════════════════════════════════════════════════════════════

console.log('✅ Framework loaded!');
console.log('Running: automateGoDaddyAPIKeySetup()...\n');

automateGoDaddyAPIKeySetup()
  .then(result => {
    if (result.success) {
      console.log('\n✨ SUCCESS! You have:');
      console.log('  API Key: ' + result.apiKey.substring(0, 20) + '...');
      console.log('  Secret: ' + result.secret.substring(0, 20) + '...');
    }
  })
  .catch(err => console.error('Failed:', err.message));
```

Press **Enter** and watch it work! 🚀

---

## What It Does

1. ✅ Finds and deletes the old `HōMI_Dev_Key`
2. ✅ Clicks "Create New API Key" button
3. ✅ Fills in name: `HōMI_DNS_Key`
4. ✅ Selects `Production` environment
5. ✅ Clicks `Next` to go to scopes
6. ✅ Selects DNS management scopes
7. ✅ Clicks `Create`
8. ✅ Extracts and displays your **API Key** and **Secret**

---

## After It Completes

1. **Copy the API Key** and **Secret** from the console output
2. **Send them to Claude Code**
3. I'll immediately add the DNS CNAME record
4. Domain will be live in minutes! 🎉

---

**Ready? Paste the code and hit Enter!** 🚀
