# FRAME Creative Studio

Independent Vietnamese creative workspace inspired by common AI studio workflows, with original branding and art direction. Built with React 19, Vinext/Vite, TypeScript, Tailwind 4, Base UI/Shadcn and Lucide.

## Run

```sh
npm install
npm run dev
npm run build
```

## Working features

- Responsive explorer, category filters, search, artwork details and reusable prompts.
- Saved inspiration and drafts stored **only on this browser** using localStorage.
- Image upload, brightness/saturation preview and full-resolution PNG export.
- Image/video prompt workspaces, aspect ratios, duration and motion presets.
- Cinema storyboards and Canvas idea cards with editable scenes, draft retention and JSON brief export.
- Brand campaign prompt templates and product briefs.
- Device speech synthesis in Vietnamese; installed voice availability depends on browser/OS.

## AI integration boundary

The current deliverable prioritizes UI/UX. No AI account, billing, cloud asset storage or real generation model is connected. The server returns an explicit 503 until configured; no simulated generation results or credit charges.

`POST /api/generate` is a server-side **adapter contract**, not a direct implementation of a particular vendor. To activate later, provide runtime secrets `FRAME_AI_ENDPOINT` (HTTPS adapter URL) and `FRAME_AI_TOKEN`. The adapter receives `{ prompt, mode, model, ratio, duration, motion, image }` and must return `{ "url": "https://…", "type": "image" | "video" }` within 90 seconds. Long-running model jobs need an asynchronous queue/polling extension before activation. Keep tokens server-side. Add app authentication, per-user quotas, rate limiting, provider billing and persistent asset storage before opening generation to shared/public access.

## Assets and provenance

- `public/frame-chrome.png`: original image generated for this project.
- Editorial portrait by Jay Soundo: https://unsplash.com/photos/0KS30qLnM_8
- Desert by Martin Sanchez: https://unsplash.com/photos/rFh890jKgcs
- Architecture by Road Trip with Raj: https://unsplash.com/photos/xrCNPGLk1wk
- Flower by Dmytro Koplyk: https://unsplash.com/photos/mA2BYYaFVRU
- Car by noir.: https://unsplash.com/photos/3vz86OsQcKY

Unsplash images are reference photography, labelled as inspiration, and are not represented as app-generated results. They are served remotely. No Higgsfield source code, logo, marketing copy or gallery media is included. FRAME has no affiliation with Higgsfield. Names and trademarks visible in reference photography remain with their respective owners.

## Data boundaries

Uploaded images are memory-only and are never included in saved drafts. A reload clears image uploads, while text, scenes and settings saved to a draft remain on this browser. Export a brief to keep an independent copy. There is no cloud sync, user authentication or payment functionality in this UI-focused version.
