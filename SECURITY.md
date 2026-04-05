# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at HOMI TECHNOLOGIES LLC. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Use GitHub's Private Vulnerability Reporting:**

1. Go to the [Security tab](https://github.com/Scamwick/Homi-Technology-llc/security) of this repository
2. Click **"Report a vulnerability"**
3. Fill out the advisory form with as much detail as possible

This ensures your report is encrypted and only visible to repository maintainers.

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

### What to Expect

- **Acknowledgment** within 48 hours of your report
- **Status update** within 7 days with our assessment
- **Resolution timeline** shared once we've triaged the issue
- **Credit** in the fix commit (unless you prefer to remain anonymous)

### Scope

The following are in scope for security reports:

- The HoMI web application (`homi/` directory)
- API routes and server-side logic
- Authentication and authorization flows
- Data exposure or leakage

### Out of Scope

- Third-party services (Supabase, Vercel) — report directly to those providers
- Denial of service attacks
- Social engineering

## Security Practices

- All secrets and API keys are stored as environment variables, never in source code
- `.env` files are gitignored
- Dependabot monitors dependencies for known vulnerabilities
- CodeQL scans code for security issues on every push
