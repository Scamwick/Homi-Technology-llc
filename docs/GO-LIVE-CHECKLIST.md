# HōMI Go-Live Checklist
Run through this before any major release or first production launch.

---

## 1. Code & Build

- [ ] All tests passing: `npm run test`
- [ ] No TypeScript errors: `npm run build` completes cleanly
- [ ] No ESLint errors blocking build
- [ ] `next.config.mjs` security headers in place
- [ ] No `console.log` of sensitive data left in code

---

## 2. Environment Variables (Vercel)

Verify these are set in Vercel dashboard → Project Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-only, not prefixed `NEXT_PUBLIC_`)
- [ ] `NEXTAUTH_SECRET` (if using NextAuth)

---

## 3. Supabase

- [ ] All migrations applied: `supabase migration list` shows no pending
- [ ] RLS enabled on all public tables
- [ ] Auth → Site URL set to production domain (`https://xn--hmi-qxa.com`)
- [ ] Auth → Redirect URLs includes production domain
- [ ] Email templates customized with HōMI branding (optional)
- [ ] Database connection pooling configured (Supabase dashboard → Database)

---

## 4. Domain & DNS

- [ ] DNS records pointing to Vercel (A/CNAME)
- [ ] Custom domain verified in Vercel dashboard
- [ ] SSL certificate issued (Vercel auto-provisions)
- [ ] `https://xn--hmi-qxa.com` loads without certificate warnings
- [ ] `www` redirect configured if needed

---

## 5. Security Headers

Verify at [securityheaders.com](https://securityheaders.com):
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Strict-Transport-Security` present
- [ ] `Content-Security-Policy` present
- [ ] `Referrer-Policy` present
- [ ] `Permissions-Policy` present

Target: A or A+ rating.

---

## 6. Auth Flow

- [ ] Sign up creates user in Supabase auth.users
- [ ] Email confirmation works (if enabled)
- [ ] Sign in redirects to `/dashboard`
- [ ] Sign out clears session and redirects to `/login`
- [ ] Password reset email sends and works
- [ ] Protected routes redirect unauthenticated users to `/login`

---

## 7. Core User Flows

- [ ] New assessment flow: start → complete all steps → score calculated
- [ ] Dashboard loads with live score data
- [ ] AI Coach chat responds
- [ ] Panels load (Command, Impulse, Network, Outcomes)
- [ ] Settings page loads
- [ ] Billing/subscription page loads (if Stripe active)

---

## 8. Mobile App (if shipping)

- [ ] `.env` file in `mobile/` with correct Supabase credentials
- [ ] App connects to production Supabase (not local/staging)
- [ ] WebView loads `https://xn--hmi-qxa.com` correctly
- [ ] Auth persists across app restarts (AsyncStorage)
- [ ] EAS build submitted to App Store / Play Store

---

## 9. Monitoring

- [ ] Vercel deployment notifications configured
- [ ] Supabase database size alert set
- [ ] At least one team member subscribed to Vercel/Supabase status pages
- [ ] Uptime monitoring set up (e.g., Better Uptime, UptimeRobot)

---

## 10. Deploy

```bash
cd /Users/codyshort/Desktop/HoMI/app
git status               # confirm clean working tree
git push origin main     # triggers Vercel auto-deploy
# OR for immediate deploy:
vercel --prod
```

Verify deployment URL in Vercel dashboard after 2-3 minutes.

---

## Post-Launch (First 24 Hours)

- [ ] Check Vercel function logs for errors
- [ ] Check Supabase logs for query errors or auth failures
- [ ] Verify at least one end-to-end user registration works on production
- [ ] Monitor error rate in Vercel dashboard → Monitoring
