# 🤖 Universal Browser Automation Framework

**Works with any browser: Safari, Chrome, Firefox, Edge, Comet, etc.**

A powerful, easy-to-use JavaScript library for automating browser tasks from the console.

---

## 🚀 Quick Start

### Step 1: Load the Framework

In your browser's **Developer Console** (F12 or Cmd+Option+I), paste:

```javascript
fetch('https://your-domain/scripts/browser-automation.js')
  .then(r => r.text())
  .then(code => eval(code));
```

Or if running locally, paste the entire `browser-automation.js` file directly into the console.

### Step 2: Use the `bot` Object

```javascript
await bot.click('button.login')
await bot.type('input[name="email"]', 'user@example.com')
await bot.wait(1000)
```

---

## 📋 Complete Command Reference

### Navigation & Waiting

```javascript
// Navigate to URL
await bot.navigate('https://example.com');

// Wait for time
await bot.wait(2000); // 2 seconds

// Wait for element
await bot.waitForElement('button.submit', 10000); // 10 second timeout

// Wait for condition
await bot.waitFor(() => document.querySelector('.loaded'), 5000);

// Check if element exists
if (bot.exists('button.delete')) { ... }

// Check if element is visible
if (bot.isVisible('.popup')) { ... }
```

### Clicking & Interactions

```javascript
// Click by selector
await bot.click('button.submit');

// Click by text content
await bot.clickByText('Delete Account', 'button');

// Type text
await bot.type('input[name="email"]', 'user@example.com');

// Clear and type
await bot.type('input[name="password"]', 'pass123', { clear: true });

// Toggle checkbox
await bot.toggleCheckbox('input[name="terms"]', true); // Check
await bot.toggleCheckbox('input[name="terms"]', false); // Uncheck

// Check radio button
await bot.checkRadio('input[name="gender"][value="male"]');

// Check radio by text
await bot.checkRadioByText('Production');

// Select dropdown option
await bot.selectOption('select[name="country"]', 'United States');

// Scroll to element
await bot.scrollTo('div.target-section');

// Scroll page
await bot.scroll('down', 500); // 500px down
await bot.scroll('up', 300);

// Hover over element
await bot.hover('button.dropdown');
```

### Getting Data

```javascript
// Get input value
const email = bot.getValue('input[name="email"]');

// Get element text
const title = bot.getText('h1.page-title');

// Get attribute
const href = bot.getAttribute('a.link', 'href');

// Extract all page text
const pageContent = bot.extractAllText();

// Extract table data
const tableData = bot.extractTable('table');

// Extract list items
const items = bot.extractList('ul.tasks');

// Extract form data
const formData = bot.extractFormData('form');
```

### Finding Elements

```javascript
// Find single element
const btn = bot.findElement('button.submit');

// Find all elements
const buttons = bot.findElements('button');

// Find by text content
const deleteBtn = bot.findByText('Delete', 'button');

// Find all with text
const allLinks = bot.findAllByText('Download', 'a');
```

### Advanced: Run Multiple Actions

```javascript
const actions = [
  {
    description: 'Fill email',
    fn: (bot) => bot.type('input[name="email"]', 'user@example.com')
  },
  {
    description: 'Fill password',
    fn: (bot) => bot.type('input[name="password"]', 'pass123')
  },
  {
    description: 'Submit',
    fn: (bot) => bot.clickByText('Sign In', 'button'),
    wait: 3000,
    ignoreError: false
  }
];

await bot.runActions(actions);
bot.printSummary();
```

### Debugging

```javascript
// Get execution history
const history = bot.getHistory();
console.log(history);

// Print summary
bot.printSummary();

// Enable/disable logging
const quietBot = new BrowserAutomation({ verbose: false });
const verboseBot = new BrowserAutomation({ verbose: true });
```

---

## 📝 Real-World Examples

### Example 1: Login Form

```javascript
const bot = new BrowserAutomation();

try {
  await bot.type('input[name="email"]', 'user@example.com');
  await bot.type('input[name="password"]', 'password123');
  await bot.clickByText('Sign In', 'button');
  await bot.wait(2000);
  console.log('✅ Login successful');
} catch (error) {
  console.error('❌ Login failed:', error);
}
```

### Example 2: Fill Multi-Step Form

```javascript
const bot = new BrowserAutomation();

const actions = [
  {
    description: 'Select country',
    fn: (bot) => bot.selectOption('select[name="country"]', 'USA')
  },
  {
    description: 'Enter company name',
    fn: (bot) => bot.type('input[name="company"]', 'Acme Corp')
  },
  {
    description: 'Check newsletter',
    fn: (bot) => bot.toggleCheckbox('input[name="newsletter"]', true)
  },
  {
    description: 'Click Next',
    fn: (bot) => bot.clickByText('Next', 'button'),
    wait: 2000
  },
  {
    description: 'Accept terms',
    fn: (bot) => bot.toggleCheckbox('input[name="terms"]', true)
  },
  {
    description: 'Submit',
    fn: (bot) => bot.clickByText('Complete', 'button'),
    wait: 3000
  }
];

await bot.runActions(actions);
bot.printSummary();
```

### Example 3: Extract Table Data and Process It

```javascript
const bot = new BrowserAutomation();

try {
  // Wait for table to load
  await bot.waitForElement('table.data');

  // Extract all rows
  const tableData = bot.extractTable('table.data');

  // Process data
  const records = tableData.map(row => ({
    id: row[0],
    name: row[1],
    email: row[2],
    status: row[3]
  }));

  console.log('Records:', records);
  console.log(`Total: ${records.length}`);

} catch (error) {
  console.error('Error:', error);
}
```

### Example 4: Wait for Dynamic Content

```javascript
const bot = new BrowserAutomation();

try {
  // Click to trigger loading
  await bot.click('button.load-more');

  // Wait for new content
  await bot.waitForElement('.new-item', 10000);

  // Extract newly loaded data
  const items = bot.findElements('.new-item');
  console.log(`Loaded ${items.length} new items`);

} catch (error) {
  console.error('Error:', error);
}
```

### Example 5: GoDaddy API Key Setup (Production Example)

See `godaddy-automation-advanced.js` for full implementation.

```javascript
// Load the framework first
eval(/* browser-automation.js code */);

// Load GoDaddy automation
eval(/* godaddy-automation-advanced.js code */);

// Run the automation
const result = await automateGoDaddyAPIKeySetup();
console.log('API Key:', result.apiKey);
console.log('Secret:', result.secret);
```

---

## 🛠️ Configuration Options

When creating a new instance:

```javascript
const bot = new BrowserAutomation({
  timeout: 30000,        // Max wait time (ms)
  waitTime: 1000,        // Default wait between actions (ms)
  verbose: true,         // Log all actions
  retryAttempts: 3       // Retry failed actions
});
```

---

## ⚡ Performance Tips

1. **Use specific selectors**: `#userId` is faster than `.container .wrapper .user-id`
2. **Batch operations**: Instead of separate waits, chain actions
3. **Set appropriate timeouts**: Shorter timeouts fail faster if element doesn't exist
4. **Disable logging if not needed**: `verbose: false` for faster execution

```javascript
// ❌ Slow
await bot.wait(1000);
await bot.click('button');
await bot.wait(1000);
await bot.type('input', 'text');

// ✅ Fast
await bot.click('button');
await bot.type('input', 'text', { wait: 500 });
```

---

## 🐛 Troubleshooting

### "Element not found" Error

```javascript
// Check if element exists first
if (bot.exists('button.submit')) {
  await bot.click('button.submit');
} else {
  console.log('Button not found - waiting...');
  await bot.waitForElement('button.submit', 10000);
  await bot.click('button.submit');
}
```

### Element is not visible

```javascript
// Check visibility
if (bot.isVisible('button.hidden')) {
  await bot.click('button.hidden');
} else {
  // Scroll to make visible
  await bot.scrollTo('button.hidden');
  await bot.click('button.hidden');
}
```

### Text content doesn't match exactly

```javascript
// Use findAllByText to see all matches
const buttons = bot.findAllByText('Save');
console.log(`Found ${buttons.length} buttons with "Save"`);

// Use partial matching with querySelector
const btn = document.querySelector('button[aria-label*="Save"]');
```

### Timing issues

```javascript
// Increase wait times
const bot = new BrowserAutomation({ waitTime: 2000 });

// Or wait for specific conditions
await bot.waitFor(
  () => document.querySelector('.loaded'),
  15000 // 15 second timeout
);
```

---

## 📚 Advanced Usage

### Custom Automation Flow

```javascript
class APIKeyAutomation extends BrowserAutomation {
  async createAPIKey(name, environment) {
    await this.clickByText('Create API Key', 'button');
    await this.type('input[name="key-name"]', name);
    await this.checkRadioByText(environment);
    await this.clickByText('Create', 'button');
    return this.extractAllText();
  }
}

const automation = new APIKeyAutomation();
const result = await automation.createAPIKey('MyKey', 'Production');
```

### Error Handling

```javascript
const bot = new BrowserAutomation();

try {
  await bot.click('button.dangerous');
  await bot.wait(2000);
} catch (error) {
  if (error.message.includes('not found')) {
    console.log('Button missing - using alternative');
    await bot.clickByText('Alternative Button', 'button');
  } else {
    throw error;
  }
}
```

---

## 🎯 Use Cases

- ✅ Form filling and submission
- ✅ Data extraction and scraping
- ✅ Multi-step workflows
- ✅ Testing user interactions
- ✅ API key generation and setup
- ✅ Content verification
- ✅ Automated workflows
- ✅ Screenshot and video recording
- ✅ A/B testing automation
- ✅ Data migration tasks

---

## 🔒 Security Notes

⚠️ **Only use in your own browser console**. Never:
- Share automation scripts with sensitive credentials
- Run untrusted automation code
- Log sensitive data to console in production

---

## 📞 Support

For issues or questions about the Browser Automation Framework:

1. Check the examples above
2. Review the error message - they're descriptive
3. Enable logging: `bot.getHistory()` to see all actions
4. Adjust timeouts for slow pages

---

## 📄 License

This framework is provided as-is for automation tasks. Use responsibly!

---

**Happy automating! 🚀**
