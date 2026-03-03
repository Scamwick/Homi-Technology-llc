# HōMI — Decision Readiness Intelligence™

The emotionally intelligent decision platform. Know if you're ready before you leap.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd homi-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
homi-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Public marketing pages
│   │   ├── (app)/              # Authenticated app pages
│   │   ├── auth/               # Authentication pages
│   │   ├── api/                # API routes
│   │   ├── onboarding/         # Onboarding flow
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── brand/              # Brand components (Logo, Compass)
│   │   ├── assessment/         # Assessment input components
│   │   └── layout/             # Layout components
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utility libraries
│   │   ├── supabase/           # Supabase clients
│   │   ├── stripe/             # Stripe clients
│   │   └── auth/               # Auth utilities
│   ├── scoring/                # Scoring engine
│   ├── stores/                 # Zustand stores
│   ├── types/                  # TypeScript types
│   └── validators/             # Zod validation schemas
├── supabase/
│   └── migrations/             # Database migrations
└── ...config files
```

## 🎨 Brand Guidelines

- **Product Name**: HōMI (H capital, ō = Unicode U+014D, M capital, I capital)
- **Colors**:
  - Cyan: #22d3ee
  - Emerald: #34d399
  - Yellow: #facc15
  - Navy Background: #0a1628
  - Surface: #1e293b
- **Font**: Inter (Google Fonts)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## 📦 Building for Production

```bash
npm run build
```

## 🚀 Deployment

This project is configured for deployment on Vercel:

```bash
vercel --prod
```

## 📄 License

Copyright © 2024 HOMI TECHNOLOGIES LLC. All rights reserved.

## 📞 Support

For support, email info@xn--hmi-qxa.com
