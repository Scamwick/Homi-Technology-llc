# HōMI Code Handoff (Generated from this chat)
Date: 2026-03-01

This ZIP contains the **code artifacts written in this chat** (web + mobile + migrations + CI + test configs).
It is not a full, runnable repo by itself unless merged into your existing monorepo.

## Structure
- apps/web/ ... Next.js 14 app files + API routes + libs + components
- apps/mobile/ ... Expo app files + libs + components
- supabase/migrations/ ... SQL migrations created in chat
- .github/workflows/ ... CI workflow created in chat
- MANIFEST.json ... list of files included

## Important
You must merge these files into your repo and resolve any conflicts with existing versions.

## Brand normalization applied
- Added apps/web/src/styles/homi-colors.css and homi-tokens.json.
- Added packages/shared (BRAND constants) using Temperature palette (#fab633/#f24822).
- Added patches for globals.css import and tailwind CSS-var colors.
