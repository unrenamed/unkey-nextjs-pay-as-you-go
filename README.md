<h1 align="center">Next.js Unkey Starter Kit</h1>

<p align="center">
 A starter template for building Pay-As-You-Go apps with Next.js, Unkey and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#more-unkey-examples"><strong>More Examples</strong></a>
</p>
<br/>

## Features

- Robust API key management via the [@unkey/api](https://www.unkey.com/docs/libraries/ts/sdk/overview):
  - Efficient creation and tier management
  - Precise quota enforcement
  - Accurate total cost calculations
  - Effortless tier upgrades without additional lookups
  - Usage analytics
- Scheduled background jobs utilizing [Vercel Crons](https://vercel.com/docs/cron-jobs):
  - Automated clean-up of obsolete API keys
  - Streamlined creation of new API keys
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Styling with [Tailwind CSS](https://tailwindcss.com)

## Clone and run locally

#### Create a database via Supabase

1. Go to [the Supabase dashboard](https://database.new).
2. Create a new project and configure database.

#### Create a root key

1. Head over to Unkey [settings.root-keys](https://app.unkey.com/settings/root-key).
2. Click "Create New Root Key".
3. Enter the key name.
4. Click "Create".

#### Create your first API

1. Now, go to [apis](https://app.unkey.com/apis) and click on the "Create New API" button.
2. Give it a name.
3. Click "Create".

#### Set up the example

1. Clone the repository

   ```bash
   git clone git@github.com:unrenamed/unkey-nextjs-pay-as-you-go
   cd unkey-nextjs-pay-as-you-go
   ```

2. Install the dependencies

   ```bash
   pnpm install
   ```

3. Use `.env.example` to create `.env.local` file and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-serice-role-key
   UNKEY_ROOT_KEY=your-unkey-root-key
   UNKEY_API_ID=your-unkey-api-id
   CRON_SECRET=your-cron-secret
   ```

   You will find more info about where to get each variable in the file.

4. You can now run the Next.js local development server:

   ```bash
   pnpm dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

## More Unkey examples

- [Manage call quotas with Rust, Rocket and Unkey](https://github.com/unrenamed/unkey-rust-rocket)
- [Protect your Rust + Axum routes with Unkey](https://github.com/unrenamed/unkey-rust-axum)
- [Use Unkey time-sensitive API keys for digital content access](https://github.com/unrenamed/unkey-pdf-view)
