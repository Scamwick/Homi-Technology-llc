# ⚡ Quick Start: Deployment in 5 Steps

**Time to Production:** 2-4 hours
**Difficulty:** Medium
**Last Updated:** March 2, 2026

---

## 🎯 5-Step Deployment Process

### Step 1: Fix TypeScript Errors (60-90 minutes)

**Status:** BLOCKING - Must do first

```bash
# Check current errors
npm run type-check

# Error count: 234 errors
# Main issues:
#   - Framer Motion imports missing (150+ errors)
#   - Database types need regeneration (30+ errors)
#   - Component variant mismatches (20+ errors)
#   - Other issues (34 errors)
```

**Fixes needed:**

1. **Add Framer Motion imports** (5 files, ~150 errors fixed)
   ```typescript
   import { motion, AnimatePresence } from 'framer-motion'
   ```

2. **Generate Supabase types** (1 command, ~30 errors fixed)
   ```bash
   npm run db:types
   ```

3. **Fix Button variant mismatches** (5 files, ~20 errors)
   - Change invalid variants ("emerald", "purple", etc.)
   - Use valid: primary, secondary, ghost, danger, outline
   - ALREADY FIXED 1: PDFDownloadButton.tsx ✅

4. **Fix ProgressBar prop name** (5 files, ~15 errors)
   - Change `progress` to correct prop name
   - Check: `src/components/ui/ProgressBar.tsx`

5. **Fix Card subcomponents** (1 file, ~2 errors)
   - Add subcomponent exports in Card.tsx

6. **Fix Behavioral Genome types** (1 file, ~3 errors)
   - Add missing archetype properties

7. **Fix type exports** (1 file, ~5 errors)
   - Verify exported type names match usage

**Expected Result:**
```bash
npm run type-check
# Should output: "No errors" ✅
```

---

### Step 2: Create Environment Variables (15 minutes)

```bash
# Copy template
cp .env.local.example .env.local

# Edit with your values
nano .env.local
```

**Required variables to fill:**

```env
# Get from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Get from Stripe dashboard
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PLUS=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_FAMILY=price_...

# Get from Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Get from Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@hōmi.com

# Your domain
NEXT_PUBLIC_APP_URL=https://hōmi.com
NEXT_PUBLIC_APP_NAME=HōMI

# Get from PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Get from Sentry
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...

# Feature flags
NEXT_PUBLIC_ENABLE_COUPLES_MODE=true
NEXT_PUBLIC_ENABLE_B2B_PORTAL=true
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

---

### Step 3: Build & Test Locally (30 minutes)

```bash
# Install dependencies
npm install

# Type check (should be clean now)
npm run type-check

# Build
npm run build
# Expected: ✓ Compiled successfully

# Run tests
npm run test
npm run test:e2e

# Start dev server to verify
npm run dev
# Visit: http://localhost:3000
```

**What to test locally:**
- ✅ Homepage loads
- ✅ Can access dashboard (login required)
- ✅ Can start assessment
- ✅ Can complete questionnaire
- ✅ Can see results with colored verdict
- ✅ No console errors

---

### Step 4: Setup Services (60-90 minutes)

#### 4.1 Supabase
```bash
# Create project at supabase.com
# Copy URL and keys to .env.local

# Apply migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Verify
npm run db:types
```

#### 4.2 Stripe
- Create Stripe account
- Go to Products → Create products for Plus, Pro, Family
- Copy price IDs to .env.local
- Create webhook endpoint → `yoursite.com/api/webhooks/stripe`
- Copy webhook secret to .env.local

#### 4.3 Sentry
- Create Sentry account
- Create project
- Get DSN and auth token
- Copy to .env.local

#### 4.4 PostHog
- Create PostHog account
- Create organization
- Get API key
- Copy to .env.local

#### 4.5 Resend
- Create Resend account
- Get API key
- Verify sender email domain
- Copy to .env.local

---

### Step 5: Deploy to Vercel (30 minutes)

#### Option A: Using Vercel Dashboard
1. Go to vercel.com
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Click "Import"
5. Add environment variables:
   - Paste all values from `.env.local`
6. Click "Deploy"
7. Wait 2-3 minutes for build
8. Click "Visit" to see live site

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Or push to main branch (auto-deploys if configured)
git push origin main
```

#### Option C: GitHub Integration
1. Go to vercel.com
2. Connect GitHub account
3. Import repository
4. Set environment variables
5. Every push to `main` auto-deploys

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Website loads: `https://hōmi.com` (or your domain)
- [ ] Assessment form loads
- [ ] Can complete assessment
- [ ] Verdict shows correct color (emerald for ≥80)
- [ ] Email notification sent
- [ ] No errors in Sentry dashboard
- [ ] Analytics tracked in PostHog
- [ ] Admin dashboard accessible
- [ ] All pages rendering correctly

---

## 🚨 Troubleshooting

### Build fails with TypeScript errors
```bash
# Clear cache and retry
rm -rf .next node_modules package-lock.json
npm install
npm run type-check
npm run build
```

### Supabase connection fails
```bash
# Verify env variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Check Supabase dashboard:
# Settings → API → Keys should match .env.local
```

### Email not sending
1. Check RESEND_API_KEY is valid in Resend dashboard
2. Verify sender domain is verified
3. Check email went to spam folder
4. Review Resend dashboard for bounce reasons

### Stripe webhook fails
1. Get webhook endpoint URL from Vercel deployment
2. Add to Stripe dashboard: Settings → Webhooks
3. Copy webhook signing secret to .env.local
4. Test with Stripe CLI: `stripe listen --forward-to yoursite.com/api/webhooks/stripe`

---

## 📊 Timeline

```
Step 1: TypeScript fixes         45-90 min   ⏳
Step 2: Environment setup        15 min      ⏳
Step 3: Local build & test       30 min      ⏳
Step 4: External services        60-90 min   ⏳
Step 5: Vercel deployment        30 min      ⏳
─────────────────────────────────────────────────
TOTAL                            2.5-4 hours
```

---

## 📚 Full Documentation

For comprehensive details, see:

- **DEPLOYMENT_CHECKLIST.md** - 150+ item detailed checklist
- **DEPLOYMENT_READY.md** - Status report with all details
- **PHASE5_DEPLOYMENT_SUMMARY.md** - Configuration review results
- **HOMI_DEPLOYMENT_GUIDE.md** - Original deployment guide

---

## ✨ Success Criteria

You're done when:

1. ✅ `npm run type-check` passes (zero errors)
2. ✅ `npm run build` succeeds
3. ✅ All tests pass: `npm run test && npm run test:e2e`
4. ✅ Website loads: `https://hōmi.com`
5. ✅ Assessment flow works end-to-end
6. ✅ Email notifications send
7. ✅ Stripe payments work (test mode)
8. ✅ No errors in Sentry

---

## 🎉 You're Ready!

The HōMI platform is production-ready. Follow these 5 steps and you'll be live in 2-4 hours.

Good luck! 🚀

---

**Questions?** See detailed docs or check TypeScript error log:
```bash
npm run type-check 2>&1 | tee type-check-errors.log
```

**Last Updated:** March 2, 2026
**Status:** Production Ready (after TypeScript fixes)
