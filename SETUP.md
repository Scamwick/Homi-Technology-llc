# HōMI — Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (recommended: 20.x)
- **npm** or **yarn**
- **Git**
- **Supabase CLI** (optional, for local development)

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url> homi
cd homi

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local with your values
nano .env.local
```

---

## 🔧 Detailed Configuration

### Step 1: Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Migrations**

   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project
   supabase link --project-ref your-project-ref

   # Push migrations
   supabase db push
   ```

   Or manually run the SQL files in `supabase/migrations/` in the Supabase SQL Editor.

3. **Configure Environment Variables**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Step 2: Stripe Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Create a new account

2. **Create Products and Prices**

   In your Stripe Dashboard, create three products:

   | Plan | Price | Features |
   |------|-------|----------|
   | Plus | $9/mo | Unlimited assessments, basic insights |
   | Pro | $19/mo | + Trinity Engine, Monte Carlo, PDF reports |
   | Family | $29/mo | + Couples Mode, priority support |

3. **Get API Keys**

   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_PLUS=price_...
   STRIPE_PRICE_PRO=price_...
   STRIPE_PRICE_FAMILY=price_...
   ```

4. **Configure Webhook**

   In Stripe Dashboard → Developers → Webhooks:
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`

### Step 3: Email Setup (Resend)

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up and verify your domain

2. **Get API Key**

   ```env
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

### Step 4: Configure App URL

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
# For local development:
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ Database Schema

The following tables are created by migrations:

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles and subscription info |
| `assessments` | Assessment records |
| `assessment_responses` | User responses to questions |
| `question_bank` | Assessment questions |
| `notifications` | User notifications |
| `future_messages` | Temporal Twin messages |
| `transformation_paths` | User transformation paths |
| `trinity_debates` | Trinity Engine debates |
| `simulation_results` | Monte Carlo results |
| `couples` | Couple relationships |
| `couple_assessments` | Joint assessments |
| `payments` | Payment records |
| `partners` | B2B partners |
| `partner_api_keys` | Partner API keys |
| `behavioral_genomes` | User behavioral patterns |

---

## 🏃 Running the Application

### Development Mode

```bash
# Start the development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e
```

---

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Deploy
   vercel
   ```

2. **Configure Environment Variables**

   In Vercel Dashboard → Project Settings → Environment Variables:
   - Add all variables from `.env.local`
   - Mark sensitive variables as "Encrypted"

3. **Configure Cron Jobs**

   Add to `vercel.json`:

   ```json
   {
     "crons": [
       {
         "path": "/api/cron/reassess-reminders",
         "schedule": "0 9 * * *"
       },
       {
         "path": "/api/cron/deliver-messages",
         "schedule": "0 * * * *"
       }
     ]
   }
   ```

### Custom Server Deployment

```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name "homi" -- start
```

---

## 📁 Project Structure

```
homi/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/             # Authenticated routes
│   │   ├── (marketing)/       # Public marketing pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Auth pages
│   │   └── onboarding/        # Onboarding flow
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives
│   │   ├── assessment/       # Assessment components
│   │   ├── brand/            # Brand components
│   │   ├── layout/           # Layout components
│   │   └── ...               # Feature components
│   ├── lib/                  # Utility libraries
│   │   ├── auth/             # Auth utilities
│   │   ├── supabase/         # Supabase clients
│   │   ├── stripe/           # Stripe utilities
│   │   └── ...               # Feature libraries
│   ├── types/                # TypeScript types
│   └── contexts/             # React contexts
├── supabase/
│   └── migrations/           # Database migrations
├── emails/                   # Email templates
├── public/                   # Static assets
├── e2e/                      # E2E tests
└── src/__tests__/            # Unit tests
```

---

## 🔐 Security Checklist

- [x] Row Level Security (RLS) enabled on all tables
- [x] API routes protected with authentication
- [x] Environment variables properly secured
- [x] Stripe webhooks validated
- [x] CORS headers configured
- [x] Rate limiting on API endpoints
- [x] Input validation with Zod
- [x] XSS protection via React

---

## 📊 Feature Summary

### Core Features (Free)
- ✅ User registration & authentication
- ✅ 3 assessments per month
- ✅ Basic readiness scores
- ✅ Assessment history
- ✅ Threshold Compass visualization

### Plus Plan ($9/mo)
- ✅ Unlimited assessments
- ✅ Detailed insights
- ✅ Transformation Path
- ✅ Email reports

### Pro Plan ($19/mo)
- ✅ Everything in Plus
- ✅ Monte Carlo Simulation
- ✅ Trinity Engine (3 AI perspectives)
- ✅ Temporal Twin (future messaging)
- ✅ PDF report generation
- ✅ Behavioral Genome

### Family Plan ($29/mo)
- ✅ Everything in Pro
- ✅ Couples Mode
- ✅ Joint assessments
- ✅ Alignment analysis
- ✅ Priority support

### Enterprise/B2B
- ✅ White-label API
- ✅ Partner portal
- ✅ Custom branding
- ✅ Dedicated support

---

## 🐛 Troubleshooting

### Common Issues

**Build fails with "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Database connection errors**
- Verify Supabase URL and keys
- Check RLS policies are enabled
- Ensure migrations have run

**Stripe webhooks not working**
- Verify webhook secret is correct
- Check endpoint URL is accessible
- Ensure events are selected in Stripe Dashboard

**Emails not sending**
- Verify Resend API key
- Check domain is verified in Resend
- Review email templates for errors

---

## 📞 Support

For issues or questions:
- Email: support@homi.io
- Documentation: https://docs.homi.io
- GitHub Issues: https://github.com/your-org/homi/issues

---

## 📄 License

MIT License - see LICENSE file for details.

---

*Last updated: March 3, 2026*
