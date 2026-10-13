# Utilynks QR

Node.js 22+ / Express / PostgreSQL platform for https://qr.utilynks.com.

## Features

- Free static QR generation: HTTP(S) links, WhatsApp prefilled messages, telephone, email and UPI payment intents.
- PNG (1120px) and SVG downloads with optional caption, logo, dark colour and six pattern styles.
- Registered users can create encrypted secret messages and one-time images. Free private codes last 24 hours, with five active codes per account.
- Paid subscriptions enable managed QR codes, long-term images and monthly Gemini design allowances. Plan retention applies to newly created codes.
- Paid dashboard: scan counts, rename, pause/resume, download and delete. Secure reveal counts reflect content reveals, not QR camera scans.
- Superadmin: platform counts, editable plans, subscription activation and audit history.
- Gemini suggests validated colours, patterns and captions. It does not generate artistic replacement QR pixels. The QR encoder retains the actual payload and error correction.

## Install

```bash
npm ci
cp .env.example .env
# Edit .env with PostgreSQL connection and unique secrets.
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Use separate random values for SESSION_SECRET and CONTENT_KEY.
npm run migrate
npm start
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before migration. The initial admin password must be at least 12 characters. Migration preserves existing accounts; changing the environment password does not reset an existing account. Remove ADMIN_PASSWORD from the runtime environment after initial setup. The admin menu appears after signing in. Password reset is not yet implemented.

For local HTTP testing set `NODE_ENV=development`, `BASE_URL=http://localhost:3000`, `TRUST_PROXY=0`. Production requires HTTPS for secure session cookies. Set `TRUST_PROXY=1` only behind a single trusted reverse proxy that overwrites forwarded headers. Never expose the application port publicly.

## Docker

Add `POSTGRES_PASSWORD` to `.env` and use a URL-safe password. Then:

```bash
docker compose up -d db
docker compose run --rm app node src/migrate.js
docker compose up -d --build app
```

Route the domain to your host, provision TLS and configure the reverse proxy using `nginx.conf.example`. The application is bound to localhost. Keep `/q/` and `/api/` outside all proxy/CDN caches. It has not been deployed to the domain automatically.

## Plans and payments

Seeded example plans are Free, Pro (₹199/month) and Business (₹499/month). Prices and allowances are editable. These are initial product settings, not a functioning payment checkout. Until a payment gateway is integrated, verify payment externally and activate a user's plan and duration in Superadmin. No card data is collected. Subscription expiry removes dashboard and AI access; previously created content stays available until its original expiry or deletion.

## Private content

AES-256-GCM encrypts private content in PostgreSQL. Retain and back up CONTENT_KEY securely; losing or rotating it without re-encryption makes existing content unreadable. One-time access uses a conditional atomic database UPDATE, so only one simultaneous reveal succeeds. A GET displays a confirmation screen without consuming the content. Link possession grants access; there is no recipient authentication. This is not end-to-end encryption and cannot prevent screenshots or downloads. Consumed payloads are cleared immediately; an hourly task clears expired payloads. Database backups may retain older encrypted content.

Uploaded images are validated by decoding, bounded to 20 megapixels and 5 MB, stripped of metadata and re-encoded as WebP at up to 1600px. Images are stored encrypted in PostgreSQL for this initial implementation. For large usage, replace this with encrypted private object storage and a cleanup worker. Secrets and raw Gemini keys never enter browser code. AI usage is atomically limited per UTC calendar month and refunded on provider failure. Set `GEMINI_API_KEY` and `GEMINI_MODEL` on the server.

QR links are public bearer links. Test printed output on multiple phones, especially for dense content, logos and unusual patterns. UPI payment success must be confirmed in the bank/payment app, not inferred from a QR scan.

## Verification

```bash
npm run check
npm test
```

`/health` checks PostgreSQL connectivity. Back up PostgreSQL and the encryption key separately. Add email verification/password recovery, a chosen payment gateway with signed webhooks, an image abuse workflow, monitoring and legal pages before a public commercial launch.
