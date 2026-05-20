# Crypto Card Calculator

Calculator for comparing the real cost of crypto card purchases in BRL, including USDC charged, current dollar rate, cashback, final cost, spread, and saved local purchase history.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Deploy with Nixpacks

This repository includes `nixpacks.toml`, `.nvmrc`, and `engines.node` so Nixpacks can build it consistently.

- Install: `npm ci`
- Build: `npm run build`
- Start: `npm run start -- -H 0.0.0.0 -p ${PORT:-3000}`

Use the default Nixpacks builder in your hosting platform and keep `PORT` managed by the platform.
