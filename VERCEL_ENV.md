# Vercel Environment Variables for KasirKu

This file lists the environment variables you should add to your Vercel project settings (do NOT commit secret values into source control).

Recommended variables to add in Vercel (Production and Preview as needed):

- DATABASE_URL
- DATABASE_URL_UNPOOLED (optional)
- PGHOST (optional)
- PGUSER (optional)
- PGDATABASE (optional)
- PGPASSWORD (optional)
- POSTGRES_URL (optional - template compatibility)
- POSTGRES_URL_NON_POOLING (optional)
- POSTGRES_USER, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_DATABASE (optional)

If you use Neon Auth / Next.js features:

- NEXT_PUBLIC_STACK_PROJECT_ID
- NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
- STACK_SECRET_SERVER_KEY

How to add them in Vercel:
1. Open your Vercel dashboard and select the project.
2. Go to Settings → Environment Variables.
3. Click "Add" and enter the **Name** (e.g., `DATABASE_URL`) and the **Value** (your secret connection string).
4. Choose the environment (Production, Preview, Development) and save.
5. Redeploy your project.

Security notes:
- Use Vercel environment variables for production; do not commit secrets to the repo.
- Remove local `.env` files when not needed and rotate credentials if accidental exposure occurs.
