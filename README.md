# Tokyo Family Trip site

The static website is deployed from this repository with GitHub Pages. The itinerary, expenses, and free memo are stored in Supabase. Anyone can view or edit them without signing in. Tokyo weather and the JPY/KRW reference rate come from public APIs.

## Supabase connection

The project URL and `sb_publishable_...` key in `supabase-config.js` are browser-safe values. Never put a Supabase secret key or legacy `service_role` key in the website.

The shared-data tables already exist in the connected project, and [`supabase/anonymous-access.sql`](supabase/anonymous-access.sql) records the no-login access policy applied there. [`supabase/schema.sql`](supabase/schema.sql) is a reference for setting up a fresh project.

**Anyone with the website address can read, add, edit, or delete the trip data.** The Supabase browser key and API address are visible in the public site, so access is not truly limited to people who have the page link. Do not store private or sensitive information in the trip memo or spending list. To make edits family-only later, replace the anonymous policies with sign-in and member-specific RLS policies.

## GitHub Pages

The included workflow publishes the site files from the `main` branch after a push. The repository must have GitHub Pages configured to use **GitHub Actions**. `plan.md` is intentionally excluded from Git tracking because it is a personal planning reference. The public repository and the published site are viewable by anyone.

The repository is `namurin/tokyo-family-trip`. The GitHub Actions workflow will deploy the page after the website files are committed to its `main` branch and Pages is configured to use GitHub Actions.
