# HōMI Compliance Checklist
Data protection and privacy requirements for the HōMI Decision OS platform.

---

## Data Classification

| Data Type | Sensitivity | Storage |
|-----------|-------------|---------|
| Email address | PII | Supabase auth.users |
| Assessment scores | Sensitive | assessments table (RLS) |
| Financial inputs | Highly Sensitive | assessments table (RLS) |
| Emotional survey data | Highly Sensitive | assessments table (RLS) |
| AI conversation history | Sensitive | ai_conversations table (RLS) |
| Partner/couple data | Highly Sensitive | partner_links table (RLS) |

---

## Row-Level Security (RLS) — Critical

Every user-data table MUST have RLS enabled. Verify:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables with user data should show `rowsecurity = true`.

Required RLS pattern for user-owned data:
```sql
CREATE POLICY "users_own_data" ON [table]
  FOR ALL USING (auth.uid() = user_id);
```

---

## Privacy Requirements

### Data Minimization
- [ ] Only collect data required for assessment scoring
- [ ] Financial inputs used for scoring only — not stored raw in production
- [ ] No tracking pixels or third-party analytics embedded

### Data Retention
- [ ] Define retention policy for assessment history (recommended: 3 years)
- [ ] Define deletion flow when user deletes account
- [ ] Verify Supabase cascade deletes are configured on `auth.users`

### User Rights (CCPA/GDPR-adjacent)
- [ ] Users can export their data (assessment history, scores)
- [ ] Users can delete their account and all associated data
- [ ] Privacy policy linked from signup flow

---

## Authentication Security

- [ ] Email verification required before dashboard access
- [ ] Password minimum length ≥ 8 characters (Supabase default)
- [ ] Session tokens expire appropriately (Supabase default: 1 hour JWT)
- [ ] No user passwords stored in application database
- [ ] Service role key NEVER exposed to client-side code

---

## Transport Security

- [ ] All traffic served over HTTPS (Vercel enforces this)
- [ ] HSTS header active: `max-age=31536000; includeSubDomains`
- [ ] All Supabase API calls use HTTPS
- [ ] WebSocket connections use WSS (`wss://*.supabase.co`)

---

## Content Security Policy

Verify CSP is active in `next.config.mjs`:
- `default-src 'self'`
- `frame-ancestors 'none'` (prevents clickjacking)
- `form-action 'self'` (prevents form hijacking)
- `connect-src` limited to Supabase domains + production domain

---

## API Key Management

| Key | Location | Rotation |
|-----|----------|----------|
| Supabase anon key | Vercel env + `.env.local` | On breach |
| Supabase service role | Vercel env ONLY | Quarterly |
| Stripe keys (if/when added) | Vercel env ONLY | On breach |

**Never commit env vars to git.** Verify `.gitignore` includes:
```
.env
.env.*
.env.local
.env.supabase
```

---

## Third-Party Services

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| Supabase | Auth + DB | User PII, assessment data |
| Vercel | Hosting | Request logs, IPs (ephemeral) |
| Google Fonts | Typography | None (CSS only, no JS tracker) |
| Stripe (future) | Billing | Name, email, payment method |

---

## Pre-Launch Compliance Sign-Off

- [ ] Privacy policy published and linked
- [ ] Terms of service published and linked
- [ ] All tables have RLS enabled and tested
- [ ] No secrets in git history (`git log --all -S "supabase"`)
- [ ] Security headers verified (use securityheaders.com)
- [ ] HTTPS enforced, no HTTP fallback
- [ ] Account deletion flow tested end-to-end
- [ ] Data export flow tested (or documented as roadmap)
