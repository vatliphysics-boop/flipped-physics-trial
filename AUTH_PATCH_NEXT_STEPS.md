# Auth patch

This patch adds:
- Supabase email/password sign up and sign in
- teacher/student profile role metadata
- secure automatic profile creation trigger
- role-change protection
- logout
- route protection for /teacher and /student
- Next.js 16 proxy.ts
- email confirmation endpoint

After extracting:
1. Run the second SQL migration in Supabase SQL Editor:
   supabase/migrations/20260920_002_auth_profile_security.sql
2. In Supabase Authentication settings:
   - Site URL: http://localhost:3000
   - Add http://localhost:3000/** to Redirect URLs while developing
3. For SSR email confirmation, update Confirm signup email template link to:
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
4. Run:
   npm run lint
   npx tsc --noEmit
   npm run dev
5. Test one teacher account and one student account.

Do not put Secret/service_role keys in .env.local.
