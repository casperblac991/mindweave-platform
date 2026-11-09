# MindWeave measurement plan

## Google Analytics 4

The shared `analytics.js` module now initializes the existing GA4 property (`G-DZ4WQDX31M`) on active pages and records privacy-safe events without emails, passwords, prompts, or payment data.

Tracked events:

- `page_view`: automatic GA4 page view.
- `select_content`: navigation to the store.
- `view_item`: product cards that expose a product ID.
- `add_to_cart`: add-to-cart actions.
- `generate_prompt`, `copy_prompt`, `save_prompt`: Prompt Lab actions.
- `search`: non-empty global searches.
- `newsletter_signup`: newsletter CTA clicks.
- `sign_up`, `login`: account form submissions.
- `creator_application_submit`: creator application submissions.

The first useful comparison window is 30 days after deployment. Historical reports still require read access to the GA4 property.

## Supabase

Run the aggregate-only queries in `reports/activity-queries.sql` from the Supabase SQL Editor. They cover accounts, confirmation rate, newsletter growth, creator applications, and AI worker health without exporting email addresses.

Supabase access is intentionally protected by RLS. Do not add a public read policy for subscriber or profile tables, and never place a service-role key in browser code.

## Phase 2 inputs

Use the resulting funnel to prioritize the store work: product discovery, product detail quality, Prompt Lab-to-product conversion, account activation, and checkout completion. Do not introduce personalized recommendations until enough event data exists to evaluate them.
