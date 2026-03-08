/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║          UNIVERSAL BROWSER AUTOMATION FRAMEWORK                          ║
 * ║  Works with any browser (Safari, Chrome, Firefox, Edge, Comet, etc.)   ║
 * ║  Handles: clicks, typing, navigation, form filling, data extraction    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class BrowserAutomation {
  constructor(options = {}) {
    this.timeout = options.timeout || 30000;
    this.verbose = options.verbose !== false;
    this.waitTime = options.waitTime || 1000;
    this.retryAttempts = options.retryAttempts || 3;
    this.history = [];
  }

  /**
   * Logging with timestamps
   */
  log(message, type = 'info') {
    if (!this.verbose) return;
    const timestamp = new Date().toLocaleTimeString();
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      click: '🖱️',
      type: '⌨️',
      navigate: '🔗',
      extract: '📋',
      wait: '⏳',
      action: '⚙️'
    };
    console.log(`[${timestamp}] ${icons[type] || '•'} ${message}`);
    this.history.push({ timestamp, message, type });
  }

  /**
   * Wait for specified time
   */
  async wait(ms = this.waitTime) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for condition to be true
   */
  async waitFor(condition, timeoutMs = this.timeout, checkInterval = 500) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        if (typeof condition === 'function') {
          if (await condition()) return true;
        } else if (condition) {
          return true;
        }
      } catch (e) {
        // Continue checking
      }
      await this.wait(checkInterval);
    }
    throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
  }

  /**
   * Wait for element to appear
   */
  async waitForElement(selector, timeoutMs = this.timeout) {
    this.log(`Waiting for element: ${selector}`, 'wait');
    await this.waitFor(
      () => document.querySelector(selector),
      timeoutMs
    );
    this.log(`Found element: ${selector}`, 'success');
    return document.querySelector(selector);
  }

  /**
   * Wait for elements to appear
   */
  async waitForElements(selector, timeoutMs = this.timeout) {
    this.log(`Waiting for elements: ${selector}`, 'wait');
    await this.waitFor(
      () => document.querySelectorAll(selector).length > 0,
      timeoutMs
    );
    this.log(`Found ${document.querySelectorAll(selector).length} elements`, 'success');
    return document.querySelectorAll(selector);
  }

  /**
   * Find element by selector
   */
  findElement(selector) {
    const el = document.querySelector(selector);
    if (!el) this.log(`Element not found: ${selector}`, 'warning');
    return el;
  }

  /**
   * Find all elements by selector
   */
  findElements(selector) {
    const els = document.querySelectorAll(selector);
    this.log(`Found ${els.length} elements matching: ${selector}`, 'info');
    return els;
  }

  /**
   * Find element by text content
   */
  findByText(text, tagName = '*') {
    const elements = document.querySelectorAll(tagName);
    for (const el of elements) {
      if (el.textContent.includes(text)) return el;
    }
    this.log(`No element found with text: "${text}"`, 'warning');
    return null;
  }

  /**
   * Find multiple elements by text pattern
   */
  findAllByText(text, tagName = '*') {
    const elements = document.querySelectorAll(tagName);
    return Array.from(elements).filter(el => el.textContent.includes(text));
  }

  /**
   * Click element by selector
   */
  async click(selector, options = {}) {
    const retry = options.retry ?? this.retryAttempts;
    let el;

    for (let attempt = 0; attempt < retry; attempt++) {
      el = this.findElement(selector);
      if (el) break;
      if (attempt < retry - 1) await this.wait(500);
    }

    if (!el) throw new Error(`Cannot click - element not found: ${selector}`);

    this.log(`Clicking: ${selector}`, 'click');
    el.click();
    await this.wait(options.wait || this.waitTime);
    return el;
  }

  /**
   * Click element by text
   */
  async clickByText(text, tagName = 'button', options = {}) {
    const el = this.findByText(text, tagName);
    if (!el) throw new Error(`Cannot click - element with text "${text}" not found`);

    this.log(`Clicking element with text: "${text}"`, 'click');
    el.click();
    await this.wait(options.wait || this.waitTime);
    return el;
  }

  /**
   * Type text into element
   */
  async type(selector, text, options = {}) {
    const el = this.findElement(selector);
    if (!el) throw new Error(`Cannot type - element not found: ${selector}`);

    this.log(`Typing into ${selector}: "${text}"`, 'type');

    // Clear existing value
    if (options.clear !== false) {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Type text
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

    await this.wait(options.wait || 300);
    return el;
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector, value, options = {}) {
    const el = this.findElement(selector);
    if (!el) throw new Error(`Cannot select - element not found: ${selector}`);

    this.log(`Selecting option "${value}" from ${selector}`, 'action');

    if (el.tagName === 'SELECT') {
      el.value = value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      el.click();
      await this.wait(300);
      const option = this.findByText(value, 'option');
      if (option) option.click();
    }

    await this.wait(options.wait || this.waitTime);
    return el;
  }

  /**
   * Check/uncheck checkbox
   */
  async toggleCheckbox(selector, shouldCheck = true) {
    const el = this.findElement(selector);
    if (!el) throw new Error(`Cannot toggle - element not found: ${selector}`);

    const isChecked = el.checked;
    const action = shouldCheck ? 'Check' : 'Uncheck';

    if ((shouldCheck && !isChecked) || (!shouldCheck && isChecked)) {
      this.log(`${action}ing checkbox: ${selector}`, 'action');
      el.click();
      await this.wait(300);
    }

    return el;
  }

  /**
   * Check radio button by selector
   */
  async checkRadio(selector) {
    const el = this.findElement(selector);
    if (!el) throw new Error(`Cannot check radio - element not found: ${selector}`);

    this.log(`Checking radio button: ${selector}`, 'action');
    el.click();
    await this.wait(300);
    return el;
  }

  /**
   * Check radio button by text/label
   */
  async checkRadioByText(text) {
    const label = this.findByText(text, 'label');
    if (!label) throw new Error(`Cannot find radio label with text: "${text}"`);

    const radio = label.querySelector('input[type="radio"]');
    if (!radio) throw new Error(`No radio button found in label: "${text}"`);

    this.log(`Checking radio button with text: "${text}"`, 'action');
    radio.click();
    await this.wait(300);
    return radio;
  }

  /**
   * Get element value
   */
  getValue(selector) {
    const el = this.findElement(selector);
    if (!el) return null;
    return el.value || el.textContent;
  }

  /**
   * Get element text
   */
  getText(selector) {
    const el = this.findElement(selector);
    if (!el) return null;
    return el.textContent.trim();
  }

  /**
   * Get attribute value
   */
  getAttribute(selector, attribute) {
    const el = this.findElement(selector);
    if (!el) return null;
    return el.getAttribute(attribute);
  }

  /**
   * Extract all text from page
   */
  extractAllText() {
    return document.body.innerText;
  }

  /**
   * Extract table data
   */
  extractTable(selector = 'table') {
    const table = this.findElement(selector);
    if (!table) return null;

    const rows = [];
    const tableRows = table.querySelectorAll('tbody tr, tr');

    for (const row of tableRows) {
      const cells = row.querySelectorAll('td, th');
      const rowData = Array.from(cells).map(cell => cell.textContent.trim());
      rows.push(rowData);
    }

    return rows;
  }

  /**
   * Extract list items
   */
  extractList(selector = 'ul, ol') {
    const list = this.findElement(selector);
    if (!list) return null;

    const items = list.querySelectorAll('li');
    return Array.from(items).map(item => item.textContent.trim());
  }

  /**
   * Extract form data
   */
  extractFormData(selector = 'form') {
    const form = this.findElement(selector);
    if (!form) return null;

    const data = {};
    const inputs = form.querySelectorAll('input, textarea, select');

    for (const input of inputs) {
      const name = input.name || input.id;
      if (name) {
        if (input.type === 'checkbox') {
          data[name] = input.checked;
        } else if (input.type === 'radio') {
          if (input.checked) data[name] = input.value;
        } else {
          data[name] = input.value;
        }
      }
    }

    return data;
  }

  /**
   * Navigate to URL
   */
  async navigate(url, options = {}) {
    this.log(`Navigating to: ${url}`, 'navigate');
    window.location.href = url;
    await this.wait(options.wait || 3000);
  }

  /**
   * Scroll to element
   */
  async scrollTo(selector, options = {}) {
    const el = this.findElement(selector);
    if (!el) throw new Error(`Cannot scroll - element not found: ${selector}`);

    this.log(`Scrolling to: ${selector}`, 'action');
    el.scrollIntoView({ behavior: 'smooth' });
    await this.wait(options.wait || 500);
    return el;
  }

  /**
   * Scroll page
   */
  async scroll(direction = 'down', amount = 500) {
    this.log(`Scrolling ${direction} by ${amount}px`, 'action');
    if (direction === 'down') window.scrollBy(0, amount);
    else if (direction === 'up') window.scrollBy(0, -amount);
    await this.wait(300);
  }

  /**
   * Hover over element
   */
  async hover(selector) {
    const el = this.findElement(selector);
    if (!el) throw new Error(`Cannot hover - element not found: ${selector}`);

    this.log(`Hovering over: ${selector}`, 'action');
    const event = new MouseEvent('mouseover', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    el.dispatchEvent(event);
    await this.wait(300);
    return el;
  }

  /**
   * Check if element exists
   */
  exists(selector) {
    return !!document.querySelector(selector);
  }

  /**
   * Check if element is visible
   */
  isVisible(selector) {
    const el = this.findElement(selector);
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  /**
   * Fill and submit form
   */
  async fillForm(formData, formSelector = 'form') {
    this.log(`Filling form with data:`, 'action');
    console.log(formData);

    for (const [selector, value] of Object.entries(formData)) {
      try {
        const el = this.findElement(selector);
        if (!el) continue;

        if (el.type === 'checkbox') {
          await this.toggleCheckbox(selector, value);
        } else if (el.type === 'radio') {
          await this.checkRadio(selector);
        } else {
          await this.type(selector, String(value));
        }
      } catch (e) {
        this.log(`Error filling field ${selector}: ${e.message}`, 'warning');
      }
    }

    this.log(`Form filled successfully`, 'success');
  }

  /**
   * Submit form
   */
  async submitForm(formSelector = 'form', submitButtonSelector = 'button[type="submit"]') {
    this.log(`Submitting form`, 'action');

    const form = this.findElement(formSelector);
    if (form) {
      form.submit();
    } else {
      const submitBtn = this.findElement(submitButtonSelector);
      if (submitBtn) {
        submitBtn.click();
      } else {
        throw new Error('Cannot find form or submit button');
      }
    }

    await this.wait(this.waitTime);
    this.log(`Form submitted`, 'success');
  }

  /**
   * Run multiple actions in sequence
   */
  async runActions(actions) {
    this.log(`Running ${actions.length} actions...`, 'action');

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      try {
        this.log(`[${i + 1}/${actions.length}] ${action.description}`, 'action');
        await action.fn(this);
        await this.wait(action.wait || this.waitTime);
      } catch (e) {
        this.log(`Error in action ${i + 1}: ${e.message}`, 'error');
        if (!action.ignoreError) throw e;
      }
    }

    this.log(`All actions completed`, 'success');
  }

  /**
   * Get execution history
   */
  getHistory() {
    return this.history;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 AUTOMATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total actions: ${this.history.length}`);
    const successCount = this.history.filter(h => h.type === 'success').length;
    const errorCount = this.history.filter(h => h.type === 'error').length;
    console.log(`Successful: ${successCount} | Errors: ${errorCount}`);
    console.log('='.repeat(70) + '\n');
  }
}

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  USAGE EXAMPLES                                                        ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * EXAMPLE 1: Fill and submit a login form
 */
async function exampleLogin() {
  const bot = new BrowserAutomation();

  try {
    await bot.type('input[name="email"]', 'user@example.com');
    await bot.type('input[name="password"]', 'password123');
    await bot.click('button[type="submit"]');
    bot.printSummary();
  } catch (e) {
    console.error('Login failed:', e);
  }
}

/**
 * EXAMPLE 2: Click buttons by text
 */
async function exampleClickByText() {
  const bot = new BrowserAutomation();

  try {
    await bot.clickByText('Create Account', 'button');
    await bot.wait(2000);
    await bot.clickByText('Continue', 'button');
    bot.printSummary();
  } catch (e) {
    console.error('Error:', e);
  }
}

/**
 * EXAMPLE 3: Wait for elements and extract data
 */
async function exampleExtractData() {
  const bot = new BrowserAutomation();

  try {
    await bot.waitForElement('table');
    const tableData = bot.extractTable('table');
    console.log('Table data:', tableData);

    const text = bot.extractAllText();
    console.log('Page text:', text);

    bot.printSummary();
  } catch (e) {
    console.error('Error:', e);
  }
}

/**
 * EXAMPLE 4: Multi-step form with actions
 */
async function exampleMultiStepForm() {
  const bot = new BrowserAutomation();

  const actions = [
    {
      description: 'Type email',
      fn: (bot) => bot.type('input[name="email"]', 'user@example.com')
    },
    {
      description: 'Type password',
      fn: (bot) => bot.type('input[name="password"]', 'pass123')
    },
    {
      description: 'Check terms checkbox',
      fn: (bot) => bot.toggleCheckbox('input[name="terms"]', true)
    },
    {
      description: 'Submit form',
      fn: (bot) => bot.clickByText('Sign Up', 'button'),
      wait: 2000
    }
  ];

  try {
    await bot.runActions(actions);
    bot.printSummary();
  } catch (e) {
    console.error('Multi-step form failed:', e);
  }
}

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  EXPOSE TO GLOBAL SCOPE                                                ║
// ╚════════════════════════════════════════════════════════════════════════╝

window.BrowserAutomation = BrowserAutomation;
window.bot = new BrowserAutomation({ verbose: true });

console.log('✅ Browser Automation Framework loaded!');
console.log('Available commands:');
console.log('  • bot.click(selector)');
console.log('  • bot.clickByText(text, tagName)');
console.log('  • bot.type(selector, text)');
console.log('  • bot.checkRadioByText(text)');
console.log('  • bot.toggleCheckbox(selector, shouldCheck)');
console.log('  • bot.extractTable(selector)');
console.log('  • bot.extractAllText()');
console.log('  • bot.extractFormData(selector)');
console.log('  • bot.waitForElement(selector)');
console.log('  • bot.wait(ms)');
console.log('  • bot.runActions(actions)');
console.log('  • bot.getHistory()');
console.log('  • bot.printSummary()');
console.log('\nQuick start: bot.click(".button-class")');
