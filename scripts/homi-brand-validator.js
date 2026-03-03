#!/usr/bin/env node

/**
 * HōMI Brand Compliance Validator
 * Version: 1.0.0
 * Organization: HOMI TECHNOLOGIES LLC
 *
 * Validates code for brand compliance violations
 * Run: node scripts/homi-brand-validator.js [directory]
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// BRAND RULES
// ============================================================

const BRAND_RULES = {
  // Correct HōMI spelling (lowercase ō with macron U+014D)
  correctSpelling: /HōMI|H&omacr;MI|H&#333;MI/g,

  // Incorrect spellings to detect
  incorrectSpellings: [
    { pattern: /HŌMI|H&Omacr;MI/g, name: 'Capital Ō (should be lowercase ō)' },
    { pattern: /HOMI(?![- ])/g, name: 'Missing macron entirely' },
    { pattern: /HoMI/g, name: 'Lowercase o without macron' },
    { pattern: /HōMi/g, name: 'Lowercase i (should be capital I)' },
    { pattern: /Hōmi/g, name: 'Lowercase m and i' }
  ],

  // Proprietary colors (exact hex required)
  proprietaryColors: {
    amber: '#fab633',
    crimson: '#f24822'
  },

  // Core brand colors
  brandColors: {
    cyan: '#22d3ee',
    emerald: '#34d399',
    yellow: '#facc15',
    navy: '#0a1628',
    navyLight: '#0f172a'
  },

  // Deprecated/banned colors
  bannedColors: [
    { hex: '#f87171', reason: 'Generic red (use HōMI Crimson #f24822)' },
    { hex: '#ef4444', reason: 'Generic red (use HōMI Crimson #f24822)' },
    { hex: '#dc2626', reason: 'Generic red (use HōMI Crimson #f24822)' }
  ],

  // Verdict thresholds
  verdictThresholds: {
    ready: 80,
    almost: 65,
    build: 50
  }
};

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

class BrandValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.filesChecked = 0;
  }

  /**
   * Validate file for brand compliance
   */
  validateFile(filePath, content) {
    this.filesChecked++;
    const ext = path.extname(filePath);

    // Check HōMI spelling
    this.checkSpelling(filePath, content);

    // Check colors in CSS/JS/HTML files
    if (['.css', '.js', '.jsx', '.ts', '.tsx', '.html'].includes(ext)) {
      this.checkColors(filePath, content);
    }

    // Check verdict thresholds in JS files
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      this.checkVerdictThresholds(filePath, content);
    }
  }

  /**
   * Check for incorrect HōMI spellings
   */
  checkSpelling(filePath, content) {
    BRAND_RULES.incorrectSpellings.forEach(({ pattern, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.errors.push({
            file: filePath,
            type: 'SPELLING',
            severity: 'ERROR',
            message: `Incorrect spelling: "${match}" (${name})`,
            fix: 'Use "HōMI" with lowercase ō (U+014D macron)'
          });
        });
      }
    });
  }

  /**
   * Check for banned or incorrect colors
   */
  checkColors(filePath, content) {
    // Check for banned colors
    BRAND_RULES.bannedColors.forEach(({ hex, reason }) => {
      const regex = new RegExp(hex, 'gi');
      if (regex.test(content)) {
        this.errors.push({
          file: filePath,
          type: 'COLOR',
          severity: 'ERROR',
          message: `Banned color ${hex}: ${reason}`,
          fix: `Replace with ${BRAND_RULES.proprietaryColors.crimson}`
        });
      }
    });

    // Check for case-sensitive brand colors
    Object.entries(BRAND_RULES.brandColors).forEach(([name, hex]) => {
      const wrongCase = new RegExp(hex.toUpperCase(), 'g');
      if (wrongCase.test(content)) {
        this.warnings.push({
          file: filePath,
          type: 'COLOR',
          severity: 'WARNING',
          message: `Color ${hex.toUpperCase()} should be lowercase: ${hex}`,
          fix: `Use lowercase: ${hex}`
        });
      }
    });

    // Check for proprietary colors case sensitivity
    Object.entries(BRAND_RULES.proprietaryColors).forEach(([name, hex]) => {
      const wrongCase = new RegExp(hex.toUpperCase(), 'g');
      if (wrongCase.test(content)) {
        this.warnings.push({
          file: filePath,
          type: 'COLOR',
          severity: 'WARNING',
          message: `Proprietary color ${hex.toUpperCase()} should be lowercase: ${hex}`,
          fix: `Use lowercase: ${hex}`
        });
      }
    });
  }

  /**
   * Check verdict threshold values
   */
  checkVerdictThresholds(filePath, content) {
    // Check for incorrect threshold values
    const thresholdPatterns = [
      { pattern: /score\s*>=\s*(\d+)/g, expected: 80, name: 'READY threshold' },
      { pattern: /score\s*>=\s*65/g, expected: 65, name: 'ALMOST threshold' },
      { pattern: /score\s*>=\s*50/g, expected: 50, name: 'BUILD threshold' }
    ];

    thresholdPatterns.forEach(({ pattern, expected, name }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const value = parseInt(match[1]);
        if (name === 'READY threshold' && value !== 80) {
          this.errors.push({
            file: filePath,
            type: 'THRESHOLD',
            severity: 'ERROR',
            message: `Incorrect ${name}: ${value} (should be ${expected})`,
            fix: `Change to: score >= ${expected}`
          });
        }
      }
    });
  }

  /**
   * Recursively scan directory
   */
  scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // Skip node_modules, .git, dist, build
      if (['node_modules', '.git', 'dist', 'build', '.next'].includes(file)) {
        return;
      }

      if (stat.isDirectory()) {
        this.scanDirectory(filePath);
      } else {
        const ext = path.extname(file);
        if (['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.md'].includes(ext)) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            this.validateFile(filePath, content);
          } catch (err) {
            console.error(`Error reading ${filePath}:`, err.message);
          }
        }
      }
    });
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('HōMI BRAND COMPLIANCE REPORT');
    console.log('='.repeat(60) + '\n');

    console.log(`Files Checked: ${this.filesChecked}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}\n`);

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✓ NO VIOLATIONS FOUND - Brand compliance 100%\n');
      return true;
    }

    // Print errors
    if (this.errors.length > 0) {
      console.log('ERRORS (must fix):');
      console.log('-'.repeat(60));
      this.errors.forEach(({ file, type, message, fix }, i) => {
        console.log(`\n${i + 1}. [${type}] ${file}`);
        console.log(`   ${message}`);
        console.log(`   Fix: ${fix}`);
      });
      console.log('');
    }

    // Print warnings
    if (this.warnings.length > 0) {
      console.log('\nWARNINGS (should fix):');
      console.log('-'.repeat(60));
      this.warnings.forEach(({ file, type, message, fix }, i) => {
        console.log(`\n${i + 1}. [${type}] ${file}`);
        console.log(`   ${message}`);
        console.log(`   Fix: ${fix}`);
      });
      console.log('');
    }

    console.log('='.repeat(60) + '\n');
    return this.errors.length === 0;
  }
}

// ============================================================
// CLI INTERFACE
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0] || process.cwd();

  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Directory not found: ${targetDir}`);
    process.exit(1);
  }

  console.log(`\nScanning: ${targetDir}\n`);

  const validator = new BrandValidator();
  validator.scanDirectory(targetDir);
  const passed = validator.generateReport();

  process.exit(passed ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for programmatic use
module.exports = { BrandValidator, BRAND_RULES };
