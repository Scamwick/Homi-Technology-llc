# HōMI Pre-Launch Checklist

## Environment & Infrastructure
- [ ] All environment variables verified in Vercel dashboard
- [ ] Database migrations applied and verified
- [ ] Stripe products and prices created (Free, Plus, Pro)
- [ ] Stripe webhook endpoint configured and tested
- [ ] Supabase RLS policies reviewed and enabled

## Authentication & Security
- [ ] Auth flows tested (sign-up, sign-in, password reset, OAuth)
- [ ] Session handling verified across page navigations
- [ ] Middleware protecting authenticated routes
- [ ] Security headers confirmed (X-Frame-Options, CSP, HSTS)
- [ ] Rate limiting configured on sensitive endpoints

## Frontend & UX
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] Assessment flow completes end-to-end
- [ ] Dashboard renders with real data
- [ ] Error states and loading states handled gracefully
- [ ] 404 and error pages styled and functional

## Brand Compliance
- [ ] HōMI spelled correctly everywhere (ō = U+014D)
- [ ] Entity name: HOMI TECHNOLOGIES LLC used in legal contexts
- [ ] Brand colors and typography consistent across all pages
- [ ] Logo renders correctly at all sizes
- [ ] Favicon and OG images configured

## Legal & Compliance
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Cookie consent implemented
- [ ] Disclaimer on scoring (not financial advice)

## SEO & Analytics
- [ ] SEO metadata verified on all public pages
- [ ] Open Graph tags configured
- [ ] Sitemap generated
- [ ] Analytics tracking configured
- [ ] robots.txt reviewed

## Performance
- [ ] Lighthouse score > 90 on key pages
- [ ] Images optimized (WebP, lazy loading)
- [ ] Bundle size reviewed
- [ ] API response times acceptable

## Final Checks
- [ ] Cron jobs verified (nurture-emails, reassess-reminders, expire-assessments)
- [ ] Email delivery tested (welcome, nurture, reminders)
- [ ] Payment flow tested end-to-end
- [ ] Backup and recovery procedures documented
- [ ] Monitoring and alerting configured
