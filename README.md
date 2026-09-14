# AutomateIQ Portfolio

Next.js App Router website for an AI automation agency. It includes the Stitch-inspired home page, Supabase-backed project CMS, real contact submissions, and dynamic case studies at `/case-study/[slug]`.

## Local setup

Install Node.js 20 LTS or newer, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For a production check:

```bash
npm run build
npm start
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) and open **Project Settings > API**.
2. Copy the project URL and the `anon` public key into a new local file named `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Open **SQL Editor** in Supabase, create a new query, paste the contents of `supabase/migrations/202609140001_initial_schema.sql`, and click **Run**.
4. Open **Authentication > Users**, click **Add user**, and create the email/password account you will use for `/admin`.
5. Start the app with `npm run dev`, then open `http://localhost:3000/admin`.
6. Sign in, create a project, add its cover image/video URL, and enable **Publish on website**. Published projects appear on the homepage and their case-study page is available at `/case-study/your-slug`.

The migration creates the `projects` and `inquiries` tables, Row Level Security policies, and a public `project-media` storage bucket. Never put a Supabase service-role key in the browser or in `.env.local` variables prefixed with `NEXT_PUBLIC_`.