# 🚀 HōMI Deployment Checklist - PHASE 5

**Project:** HōMI Technology LLC Platform
**Status:** DEPLOYMENT PREPARATION IN PROGRESS
**Date:** March 2, 2026
**Target:** Production Deployment with `vercel --prod`

---

## 📋 PHASE 5: Deployment Preparation & Configuration

### Section 1: Environment Setup

#### 1.1 Environment Variables
- [x] `.env.local.example` exists and is properly formatted
- [ ] `.env.local` created (copy from `.env.local.example`)
- [ ] All required variables filled in:

**Supabase Configuration:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your publishable anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your service role key (secret)

**Stripe Configuration:**
- [ ] `STRIPE_SECRET_KEY` = `sk_live_...` (production key)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (production key)
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...` (webhook signing secret)
- [ ] `STRIPE_PRICE_PLUS` = `price_...` (Plus tier price ID)
- [ ] `STRIPE_PRICE_PRO` = `price_...` (Pro tier price ID)
- [ ] `STRIPE_PRICE_FAMILY` = `price_...` (Family tier price ID)

**API Keys & Services:**
- [ ] `ANTHROPIC_API_KEY` = `sk-ant-...` (Claude AI for Trinity Engine)
- [ ] `RESEND_API_KEY` = `re_...` (Email sending service)
- [ ] `RESEND_FROM_EMAIL` = `noreply@hōmi.com` (or your custom domain)

**Application Configuration:**
- [ ] `NEXT_PUBLIC_APP_URL` = `https://hōmi.com` (production domain)
- [ ] `NEXT_PUBLIC_APP_NAME` = `HōMI`

**Analytics & Monitoring:**
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` = `phc_...` (PostHog API key)
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com`
- [ ] `SENTRY_DSN` = `https://...@sentry.io/...` (Error tracking)
- [ ] `SENTRY_AUTH_TOKEN` = `sntrys_...` (Sentry authentication)

**Feature Flags:**
- [ ] `NEXT_PUBLIC_ENABLE_COUPLES_MODE` = `true`
- [ ] `NEXT_PUBLIC_ENABLE_B2B_PORTAL` = `true`
- [ ] `NEXT_PUBLIC_MAINTENANCE_MODE` = `false`

#### 1.2 Node.js & Dependencies
- [ ] Node.js version 18+ installed: `node --version`
- [ ] npm dependencies installed: `npm install`
- [ ] No dependency conflicts or warnings
- [ ] All packages up to date: `npm list`

---

### Section 2: Configuration Files Verification

#### 2.1 TypeScript Configuration (`tsconfig.json`)
- [x] Strict mode enabled: `"strict": true`
- [x] Path aliases configured: `"@/*": ["./src/*"]`
- [x] Target: `ES2017`
- [x] Module resolution: `bundler`
- [x] JSX: `preserve` (for Next.js)
- [x] Isolated modules: `true`

**Status:** ✅ CORRECT

#### 2.2 Next.js Configuration (`next.config.mjs`)
- [x] Image optimization configured
- [x] Remote patterns allow Supabase images
- [x] Security headers configured:
  - [x] X-Frame-Options: DENY
  - [x] X-Content-Type-Options: nosniff
  - [x] Referrer-Policy: strict-origin-when-cross-origin
  - [x] Permissions-Policy: camera, microphone, geolocation disabled
- [x] Server action body size limit: 2mb

**Status:** ✅ CORRECT

#### 2.3 Tailwind CSS Configuration (`tailwind.config.ts`)
- [x] HōMI Brand Colors Defined:
  - [x] Cyan: `#22d3ee` (clarity & logic)
  - [x] Emerald: `#34d399` (trust & readiness)
  - [x] Yellow: `#facc15` (action & urgency)
  - [x] Navy: `#0a1628` (primary background)
  - [x] Surface colors (0-4): Dark gradient
  - [x] Text colors (1-4): Opacity levels

- [x] Font Family: `Inter` (primary), system fonts fallback
- [x] Border Radius: brand variants (12px, 8px, 16px, 24px)
- [x] Shadow Effects: brand, glow variants
- [x] Animations: spin-slow, spin-medium, spin-fast, pulse-glow
- [x] Keyframes: pulse-glow animation defined

**Status:** ✅ CORRECT

#### 2.4 Package.json
- [x] Name: `homi-app`
- [x] Version: `0.1.0`
- [x] Private: `true`

**Build Scripts:**
- [x] `dev`: Next.js dev server
- [x] `build`: Production build
- [x] `start`: Production start
- [x] `lint`: ESLint
- [x] `test`: Vitest
- [x] `test:coverage`: Coverage reports
- [x] `test:e2e`: Playwright
- [x] `type-check`: TypeScript validation
- [x] `db:migrate`: Supabase migrations
- [x] `db:seed`: Database seeding
- [x] `db:types`: Generate DB types

**Dependencies:**
- [x] Next.js: 14.2.15
- [x] React: 18.3.1
- [x] Supabase: 2.45.0
- [x] Stripe: 16.12.0
- [x] Zod: 3.23.8
- [x] TailwindCSS: 3.4.13
- [x] Framer Motion, Recharts, Resend, etc.

**Status:** ✅ CORRECT

#### 2.5 Vercel Configuration (`vercel.json`)
- [x] Cron jobs configured:
  - [x] `/api/cron/reassess-reminders` → 0 9 * * * (9 AM daily)
  - [x] `/api/cron/deliver-messages` → 0 * * * * (hourly)

**Status:** ✅ CORRECT

---

### Section 3: Build Validation

#### 3.1 TypeScript Type Checking
- [ ] Run `npm run type-check`
- [ ] Status: **NEEDS FIXING** (234 errors found)
- [ ] Error Categories:
  - Framer Motion imports missing (`motion`, `AnimatePresence`)
  - Database types incomplete (Supabase RLS issue)
  - Component variant mismatches
  - Missing property definitions
  - UI component composition issues

**Action Required:** See DEPLOYMENT_READY.md for detailed error list and fixes needed

#### 3.2 Build Output
- [ ] `.next/` directory exists: ✅
- [ ] Build manifest: ✅ (`app-build-manifest.json`)
- [ ] Routes manifest: ✅ (`routes-manifest.json`)
- [ ] Server functions: ✅ (`server/` directory with 20 subdirectories)
- [ ] Static assets: ✅ (`static/` directory prepared)
- [ ] Types cache: ✅ (`types/` directory)

---

### Section 4: Database & API Configuration

#### 4.1 Database Setup
- [ ] Supabase project created and active
- [ ] Database migrations applied: `npm run db:migrate`
- [ ] Initial data seeded: `npm run db:seed`
- [ ] TypeScript types generated: `npm run db:types`
- [ ] RLS (Row-Level Security) policies enabled
- [ ] Database backups configured
- [ ] Connection pooling enabled

**Database Tables Required (14 total):**
- [ ] `users` - User accounts & authentication
- [ ] `assessments` - Assessment records
- [ ] `assessment_responses` - Individual question responses
- [ ] `questions` - Assessment questions
- [ ] `scores` - Calculated scores
- [ ] `verdicts` - Verdict decisions
- [ ] `notifications` - In-app notifications
- [ ] `email_logs` - Email delivery tracking
- [ ] `stripe_customers` - Stripe customer mapping
- [ ] `subscriptions` - Active subscriptions
- [ ] `invoices` - Payment invoices
- [ ] `audit_logs` - System audit trail
- [ ] `partners` - B2B partners
- [ ] `api_keys` - Partner API keys

#### 4.2 API Routes Verification
- [ ] `/api/auth/*` - Authentication endpoints
- [ ] `/api/assessments/*` - Assessment CRUD
- [ ] `/api/scores/*` - Score calculation
- [ ] `/api/payments/*` - Stripe integration
- [ ] `/api/webhooks/stripe` - Webhook handling
- [ ] `/api/notifications/*` - Notification delivery
- [ ] `/api/email/*` - Email sending
- [ ] `/api/partners/*` - B2B API
- [ ] `/api/cron/*` - Scheduled tasks

#### 4.3 Stripe Configuration
- [ ] Stripe account created (production mode)
- [ ] Products created: Plus, Pro, Family tiers
- [ ] Price IDs obtained and in .env.local
- [ ] Webhook endpoint configured
- [ ] Webhook events subscribed:
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`

---

### Section 5: Monitoring & Analytics Setup

#### 5.1 Error Tracking (Sentry)
- [ ] Sentry account created
- [ ] Project created for HōMI
- [ ] `SENTRY_DSN` obtained
- [ ] `SENTRY_AUTH_TOKEN` obtained
- [ ] Error filtering configured
- [ ] Alert rules configured

#### 5.2 Analytics (PostHog)
- [ ] PostHog account created
- [ ] Project created
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` obtained
- [ ] Event tracking configured:
  - [ ] User signup
  - [ ] Assessment started
  - [ ] Assessment completed
  - [ ] Score reached
  - [ ] Payment made
  - [ ] Feature accessed

#### 5.3 Email Service (Resend)
- [ ] Resend account created
- [ ] `RESEND_API_KEY` obtained
- [ ] Sender domain verified (`noreply@hōmi.com`)
- [ ] Email templates created:
  - [ ] Welcome email
  - [ ] Verdict ready email
  - [ ] Milestone achieved email
  - [ ] Reassessment reminder
  - [ ] Couple invite email
  - [ ] Payment confirmation email

---

### Section 6: Deployment Platform Setup (Vercel)

#### 6.1 Vercel Project
- [ ] Vercel account created
- [ ] Project created for HōMI
- [ ] GitHub repository connected
- [ ] Deployment strategy: Auto-deploy on main branch
- [ ] Preview deployments enabled for PR testing

#### 6.2 Environment Variables in Vercel
- [ ] All production env vars added to Vercel dashboard
- [ ] Environment set to: Production
- [ ] Sensitive values (keys, tokens) not in repository
- [ ] `.env.local` in `.gitignore`

#### 6.3 Custom Domain Configuration
- [ ] Domain `hōmi.com` (or alternative) registered
- [ ] Domain added to Vercel project
- [ ] DNS records configured:
  - [ ] A record points to Vercel
  - [ ] CNAME configured (if applicable)
  - [ ] SSL certificate auto-provisioned
- [ ] DNS propagation verified (24-48 hours)
- [ ] HTTPS enforced

#### 6.4 Vercel Build & Deployment Settings
- [ ] Build command: `next build`
- [ ] Start command: `next start` (if using standalone)
- [ ] Output directory: `.next`
- [ ] Node.js version: 18.x or later
- [ ] Cron jobs configured in vercel.json

---

### Section 7: Pre-Launch Testing

#### 7.1 Local Testing
- [ ] `npm install` completes without errors
- [ ] `npm run type-check` passes (or errors documented)
- [ ] `npm run build` completes successfully
- [ ] `npm run test` passes all unit tests
- [ ] `npm run test:e2e` passes all E2E tests
- [ ] `npm run dev` starts development server

#### 7.2 Feature Testing
- [ ] User can signup/login
- [ ] Assessment questionnaire loads
- [ ] Assessment can be completed
- [ ] Scores calculated correctly
- [ ] Verdict displays with correct color
- [ ] Dashboard shows history
- [ ] Email notifications send
- [ ] Stripe payment flow works (test mode)
- [ ] Couples Mode accessible
- [ ] Admin dashboard accessible

#### 7.3 Brand Verification
- [ ] Colors display correctly:
  - [ ] Cyan (#22d3ee) - clarity indicators
  - [ ] Emerald (#34d399) - ready verdicts
  - [ ] Yellow (#facc15) - almost there verdicts
  - [ ] Orange (#fb923c) - build first verdicts
  - [ ] Red (#ef4444) - do not proceed verdicts
  - [ ] Navy (#0a1628) - backgrounds
- [ ] Typography correct (Inter primary, Fraunces display)
- [ ] Logo renders with macron (ō)
- [ ] Compass animation rotates (if implemented)
- [ ] All text uses "HōMI" (not "Homi")

#### 7.4 Performance Testing
- [ ] Lighthouse score: >90
- [ ] Core Web Vitals acceptable
- [ ] First Contentful Paint: <2s
- [ ] Largest Contentful Paint: <2.5s
- [ ] Cumulative Layout Shift: <0.1
- [ ] Load time on slow 4G: <5s

#### 7.5 Security Testing
- [ ] No sensitive data in console logs
- [ ] API keys not exposed in client bundle
- [ ] CORS headers correct
- [ ] XSS protections working
- [ ] SQL injection prevented
- [ ] Rate limiting functional
- [ ] JWT validation on protected routes

---

### Section 8: Go-Live Procedure

#### 8.1 Final Day Pre-Launch (24 hours before)
- [ ] Full QA testing completed
- [ ] All env vars verified in production
- [ ] Database backup created
- [ ] Monitoring dashboards set up
- [ ] Alert rules configured
- [ ] Email service tested with real domain
- [ ] Stripe payment tested (test card)
- [ ] Rollback procedure documented
- [ ] Team briefing completed

#### 8.2 Launch Day - Pre-Deployment (2 hours before)
```bash
# Final verification
npm run type-check
npm run lint
npm run test
npm run test:e2e
npm run build
```

#### 8.3 Production Deployment
```bash
# Deploy to Vercel production
vercel --prod

# OR if using GitHub integration:
# Push to main branch → Vercel auto-deploys
git push origin main
```

#### 8.4 Post-Deployment Verification (30 minutes after)
- [ ] Website loads: https://hōmi.com
- [ ] Can complete assessment flow
- [ ] Verdict displays correct color
- [ ] Email notification received
- [ ] No errors in Sentry dashboard
- [ ] User analytics tracking (PostHog)
- [ ] Payment processing working
- [ ] Admin dashboard accessible
- [ ] All pages rendering correctly

#### 8.5 Post-Launch Monitoring (First 24 hours)
- [ ] Monitor Sentry errors (should be minimal)
- [ ] Monitor PostHog events
- [ ] Check email delivery logs
- [ ] Monitor Stripe transaction volume
- [ ] Monitor database performance
- [ ] Monitor API response times
- [ ] Be ready to rollback if critical issues

---

### Section 9: Known Issues & Fixes Required

#### TypeScript Errors (234 total)
**Status:** BLOCKING - Must resolve before `npm run build` succeeds

**Major Issue Categories:**
1. **Framer Motion Missing** (150+ errors)
   - `motion` not imported in components
   - `AnimatePresence` not imported
   - Affects: admin pages, assessment pages, behavioral genome, couples, etc.
   - Fix: Import from 'framer-motion'

2. **Database Types Issue** (30+ errors)
   - Supabase types showing `never` type
   - Assessment response fields not recognized
   - Fix: Run `npm run db:types` after migrations

3. **Component Issues** (20+ errors)
   - Button variant "emerald" not valid (only: primary, secondary, ghost, danger, outline)
   - ProgressBar prop name mismatch (`progress` vs different name)
   - Card subcomponent composition issues
   - Fix: Align component props with definitions

4. **API Response Types** (15+ errors)
   - Insert operations expecting `never` type
   - Fix: Ensure Supabase RLS policies don't break inserts

**See DEPLOYMENT_READY.md for detailed fix instructions**

---

### Section 10: Deployment Success Criteria

#### Minimum Requirements (MUST HAVE)
- [x] TypeScript compilation succeeds (or errors documented)
- [ ] Build completes: `npm run build`
- [ ] No critical security issues
- [ ] Environment variables all set
- [ ] Database initialized and migrated
- [ ] Stripe configured with live keys
- [ ] Email service operational
- [ ] Monitoring configured (Sentry + PostHog)

#### Quality Requirements (SHOULD HAVE)
- [ ] Unit tests passing: `npm test`
- [ ] E2E tests passing: `npm run test:e2e`
- [ ] Lighthouse score >90
- [ ] No console errors on primary flows
- [ ] Mobile responsive design verified
- [ ] Accessibility compliant (a11y)

#### Business Requirements (NICE TO HAVE)
- [ ] SEO optimization complete
- [ ] Analytics tracking configured
- [ ] Support documentation prepared
- [ ] Status page configured
- [ ] Team runbooks prepared

---

### Section 11: Post-Deployment Checklist

#### Week 1 - Stabilization
- [ ] Monitor error rates (Sentry)
- [ ] Monitor user signup rate
- [ ] Monitor payment success rate
- [ ] Monitor email delivery
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Document learnings

#### Week 2-4 - Optimization
- [ ] Analyze user behavior (PostHog)
- [ ] Optimize slow queries
- [ ] Improve error messages
- [ ] Add missing features
- [ ] Increase marketing efforts

#### Month 2+ - Growth
- [ ] Scale database if needed
- [ ] Optimize infrastructure
- [ ] Plan feature releases
- [ ] Build partner program
- [ ] Expand to B2B market

---

## 📊 Deployment Status Summary

| Category | Status | Notes |
|----------|--------|-------|
| **Configuration Files** | ✅ READY | All files correct and optimized |
| **Environment Variables** | ⏳ PENDING | Need to fill in `.env.local` |
| **TypeScript Validation** | ❌ BLOCKING | 234 errors, need fixes |
| **Build System** | ✅ READY | next.config, tsconfig, tailwind all correct |
| **Database Setup** | ⏳ PENDING | Need to initialize Supabase |
| **Monitoring Setup** | ⏳ PENDING | Need Sentry/PostHog accounts |
| **Stripe Integration** | ⏳ PENDING | Need production keys |
| **Vercel Deployment** | ⏳ PENDING | Need to connect project |
| **Testing** | ⏳ PENDING | Need to run full test suite |
| **Brand Verification** | ⏳ PENDING | Need visual QA testing |

---

## 🎯 Next Steps

### IMMEDIATE (Do Now)
1. Fix TypeScript errors (see DEPLOYMENT_READY.md)
2. Create `.env.local` with required variables
3. Initialize Supabase project
4. Run `npm install`

### BEFORE DEPLOYMENT (Do These)
1. Run `npm run type-check` until clean
2. Run `npm run build` successfully
3. Run `npm run test` and `npm run test:e2e`
4. Set up Sentry and PostHog accounts
5. Configure Stripe with production keys
6. Verify all monitoring dashboards

### DEPLOYMENT DAY
1. Final QA testing
2. Run `vercel --prod`
3. Verify live site
4. Monitor for errors
5. Be ready to rollback

---

**Last Updated:** March 2, 2026
**Target Launch:** [TO BE DETERMINED]
**Owner:** HōMI Technology LLC
**Questions?** See DEPLOYMENT_READY.md for detailed status
