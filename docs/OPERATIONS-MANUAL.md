# HōMI Operations Manual
Stack: Next.js 14 · Supabase · Vercel · GitHub

---

## Deployments

### Deploy to Production
```bash
cd /Users/codyshort/Desktop/HoMI/app
vercel --prod
```

### Deploy Preview
```bash
vercel
```

### Rollback (Vercel Dashboard)
1. Open vercel.com → HōMI project
2. Deployments tab → find last good deployment
3. "..." menu → Promote to Production

---

## Database (Supabase)

Project ID: `rcmfeschilprbekrxawb`
Region: us-east-1

### Run a Query
```bash
# Via Supabase MCP tool in Claude Code
# Or via Supabase dashboard → SQL Editor
```

### Apply a Migration
```bash
# Local file → Supabase
supabase db push
# or via MCP: apply_migration with SQL content
```

### Check Migration Status
```bash
supabase migration list
```

### Backup (Point-in-Time Recovery)
Supabase Pro includes PITR. Configure via Dashboard → Database → Backups.

---

## Local Development

```bash
cd /Users/codyshort/Desktop/HoMI/app
npm install
npm run dev          # http://localhost:3000
```

### Env vars required (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## GitHub

Remote: `https://github.com/Scamwick/Homi-Technology-llc.git`
Branch: `main`

```bash
git add -p          # stage changes interactively
git commit -m "..."
git push origin main
```

Vercel auto-deploys on push to `main`.

---

## Mobile App

Location: `/Users/codyshort/Desktop/HoMI/app/mobile/`

```bash
cd /Users/codyshort/Desktop/HoMI/app/mobile
npx expo start       # Expo Go / simulator
npx expo build       # EAS build (requires eas-cli)
```

Env vars (`.env`):
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Monitoring

- **Uptime**: Vercel dashboard → Deployments
- **Database**: Supabase dashboard → Database Health
- **Errors**: Vercel dashboard → Functions → Logs
- **Auth issues**: Supabase → Authentication → Logs

### Key Health Checks
| Check | URL |
|-------|-----|
| Homepage | https://xn--hmi-qxa.com |
| Auth flow | https://xn--hmi-qxa.com/login |
| Dashboard | https://xn--hmi-qxa.com/dashboard |
| API health | https://rcmfeschilprbekrxawb.supabase.co/rest/v1/ |

---

## Incident Response

### Site Down
1. Check Vercel status page
2. Check last deployment — rollback if needed
3. Check Supabase status page
4. Check environment variables are set in Vercel dashboard

### Auth Broken
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env
2. Check Supabase Auth settings → Site URL matches production domain
3. Check Supabase Auth → Redirect URLs includes production URL

### Database Errors
1. Supabase dashboard → Database → check connection pool
2. Review RLS policies if data isn't loading
3. Check for failed migrations in migration log

---

## Routine Maintenance

| Task | Frequency | How |
|------|-----------|-----|
| Review Vercel deploy logs | Weekly | Vercel dashboard |
| Check Supabase slow queries | Weekly | Dashboard → Reports |
| Review auth user growth | Monthly | Supabase → Authentication |
| Rotate service role key | Quarterly | Supabase → Settings → API |
| Dependency updates | Monthly | `npm outdated` → update + test |
