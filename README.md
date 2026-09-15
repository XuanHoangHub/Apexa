# Apexa Creative Studio

Independent creative studio platform inspired by modern generative AI production workflows, featuring original branding, art direction, and interaction design. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Base UI/Shadcn, and Lucide.

## Getting Started

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build Scripts

```sh
npm run build         # Next.js production build (Turbopack)
npm run typecheck     # TypeScript strict typechecking
npm run lint          # Code quality and accessibility linting
npm run build:sites   # OpenNext Cloudflare deployment bundle staging
```

## Features

- **Header-First Navigation**: Sticky, compact header navigation bar with group dividers, category badges, and quick view switching (inspired by Higgsfield).
- **Command Palette & Shortcuts**: Instant `Ctrl+K` (`⌘K`) search palette, numeric key view navigation (`1`–`9`), `/` for search, `N` for new creation, and `?` for help.
- **Inspiration Explorer**: Curated creative showcases, category filtering (Cinematic, Portrait, Nature, Abstract, Architecture, Product), search, and one-click prompt remixing.
- **Local Persistence**: Drafts and bookmarked works are securely saved **only in your browser** via `localStorage`.
- **Local Image Editor**: Client-side reference upload, real-time brightness/saturation adjustments, and full-resolution PNG export without sending imagery to any server.
- **Creative Studios & Tools**: Tailored controls for Image Generation, Video Generation, Audio & Voice, Cinema Studio 4.0, Brand Studio, and Idea Canvas with customizable aspect ratios, durations, and camera motions.
- **Cinema Storyboard & Canvas**: Multi-scene storyboard sequencing with draft retention and JSON creative brief export.
- **Brand Campaign Templates**: Automated prompt generation for product launches, social campaigns, and lifestyle stories.
- **Voiceover Audition**: In-browser speech synthesis using your device's built-in English voice engine.

## Supabase Authentication

Email/password authentication is connected to the supplied Supabase project using
`@supabase/supabase-js` and `@supabase/ssr` (exact versions in package.json).
Copy the public configuration from `.env.example` into `.env.local` for a fresh
checkout. Set both `NEXT_PUBLIC_SUPABASE_*` variables before building for hosting.
No service-role key is needed or included.

- `/login`, `/signup`: Vietnamese responsive UI, Motion transitions, password visibility, strength requirements, loading/error states, and email confirmation feedback.
- `/forgot-password`, `/reset-password`: email recovery and authenticated password update.
- `/account`: server-verified profile, password change, and local-device sign-out.
- `/auth/callback`: PKCE exchange, optional email token-hash verification, and fixed same-origin destinations.
- The existing studio remains available to visitors; its header reflects the current Auth session. Drafts are still device-local, not account-synced.

### Supabase dashboard configuration

Email signup and confirmation were verified enabled; Google/GitHub were disabled.
The publishable key can perform client authentication but cannot configure Auth
redirects, email templates, SMTP, or OAuth provider credentials.

In [Authentication → URL Configuration](https://supabase.com/dashboard/project/njrbrhkxpsbqehlpcfdy/auth/url-configuration),
set Site URL to your actual deployed origin and add these allowed redirect URLs:

```text
http://localhost:3001/auth/callback
http://localhost:3001/auth/callback?next=/reset-password
https://frame-creative-studio.hoang-benjamin-creat.chatgpt.site/auth/callback
https://frame-creative-studio.hoang-benjamin-creat.chatgpt.site/auth/callback?next=/reset-password
```

Use the actual development port if it differs. Default email templates should
keep `{{ .ConfirmationURL }}` and confirmation/recovery links must be opened in
the same browser that requested them (PKCE verifier cookie). For cross-browser
email verification, configure the email template link as
`{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup` for confirmation and
`{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery` for recovery.
Configure custom SMTP for delivery to general users; Supabase's default sender
has recipient and rate restrictions. Existing provider settings were not changed.

### Auth verification

With the production server running on port 3010, `node scripts/check-auth.mjs` checks public auth routes, private caching,
unauthenticated redirects, forged cookies, and invalid callback destinations.
Set `AUTH_TEST_ORIGIN` if needed (use a production build; Next.js development mode
overrides cache headers). Set `AUTH_TEST_REMOTE=1` to additionally verify
that the real Supabase project rejects randomly generated invalid credentials.
These checks never create users, send emails, or change passwords. Full positive
signup/confirmation/recovery testing requires a real inbox and configured redirects.

## AI Provider Setup

The current deliverable focuses on UI/UX, workflow fidelity, and client-side creative tools. No third-party AI provider, billing account, or persistent cloud asset storage is connected by default.

`POST /api/generate` serves as a server-side **adapter contract**. To connect a live provider:

1. Configure `APEXA_AI_ENDPOINT` (or `FRAME_AI_ENDPOINT`) and `APEXA_AI_TOKEN` in your environment.
2. The adapter receives `{ prompt, mode, model, ratio, duration, motion, image }` and expects `{ "url": "https://...", "type": "image" | "video" }`.
3. For asynchronous or queued long-running generation jobs, extend with a polling/webhook flow. Keep API tokens server-side.

## Assets & Provenance

- `public/frame-chrome.png`: Original artwork created specifically for this project.
- Editorial portrait by Jay Soundo: https://unsplash.com/photos/0KS30qLnM_8
- Desert dunes by Martin Sanchez: https://unsplash.com/photos/rFh890jKgcs
- Architecture by Road Trip with Raj: https://unsplash.com/photos/xrCNPGLk1wk
- Floral macro by Dmytro Koplyk: https://unsplash.com/photos/mA2BYYaFVRU
- Sports car by noir.: https://unsplash.com/photos/3vz86OsQcKY

Unsplash images serve strictly as reference photography labelled as inspiration and are not represented as app-generated outputs. Names and trademarks visible in reference photography remain with their respective owners.

## Data Boundaries

Uploaded images remain in-memory and are never stored in saved drafts or synced to external servers. Refreshing clears transient uploads, while text prompts, storyboard scenes, and creative settings saved to drafts persist locally on your device.
