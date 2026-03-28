# NebulaSEO

AI-powered local SEO platform. Space-themed, fully animated UI built with Next.js 14.

## Pages
- `/` — Marketing homepage
- `/how-it-works` — Process & results page with live heatmap preview
- `/pricing` — Pricing tiers with FAQ & comparison table
- `/login` — Login / signup with Google OAuth UI
- `/dashboard` — Main dashboard
- `/dashboard/businesses` — Business management
- `/dashboard/automation` — Automation feed
- `/dashboard/reviews` — Reviews management
- `/dashboard/reports` — Performance reports + heatmap audits
- `/dashboard/citations` — Citation tracker
- `/dashboard/settings` — Profile, agency, notifications, billing, integrations

---

## Deploy to Vercel (Recommended)

### Option 1 — Vercel CLI (fastest)
```bash
npm i -g vercel
vercel
```

### Option 2 — GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Vercel auto-detects Next.js — just click **Deploy**

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Inline CSS with CSS variables (no Tailwind dependency)
- **Fonts**: Orbitron + Syne (Google Fonts)
- **Animations**: Pure CSS + Canvas API for starfield
- **Deploy**: Vercel (zero config)

---

## Adding Authentication (Next Step)
We recommend [NextAuth.js](https://next-auth.js.org/) for adding real Google OAuth:

```bash
npm install next-auth
```

Add `NEXTAUTH_SECRET` and `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` to your Vercel environment variables.

## Adding a Database (Next Step)
For storing businesses, reviews, and reports:
- **Planetscale** or **Supabase** work great with Next.js
- Use **Prisma** as the ORM

---

## Environment Variables (for future use)
Create a `.env.local` file:
```
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=your_database_url
```
