# Sign In With Solana and passkeys in Next.js

Solana wallet login (Sign In With Solana) and passkeys for a Next.js App Router app, with [Synq](https://synq.build)'s `@synqauth/nextjs`: the wallet signs on your own page, Synq checks the signature, and the browser never holds a token.

## Quick start

```sh
git clone https://github.com/aerosol-build/synq-examples.git
cd synq-examples/nextjs-solana-login
cp .env.example .env.local   # then fill in your brand's issuer and app
npm install
npm run dev                  # https://localhost:3000
```

## Before you run it: your brand and app

1. [Sign up for Synq](https://synq.build), verify your email and make an org. Its first brand signs people in at once, on the free Starter plan, and offers Solana wallets and passkeys from the start.
2. In the dashboard, open the brand's **Apps** and make a **New app**: a Web app, with `https://localhost:3000/api/auth/callback` as its redirect URI. Add `https://localhost:3000/` under **After signing out**.
3. Copy the app's client ID and secret into `.env.local`, with the brand's issuer (on the brand's **Settings**) as `SYNQ_ISSUER`, and `openssl rand -base64 32` as `SYNQ_SESSION_SECRET`.
4. Optional: turn on **Sign in from this app's own screens** on the app's page. The wallet's signature and the passkey are then traded for a session right on your page. Without it, a wallet sign-in passes through the issuer with no page in between, and a passkey opens the hosted page's passkey step.

`npm run dev` serves https (`next dev --experimental-https`): Synq takes only https redirect URIs, on localhost too. The first run asks for your password once, to trust a local certificate.

## What it shows

- `src/components/SignIn.tsx`: the browser's Solana wallets, found through the Wallet Standard (`useSolanaWallets` from `@synqauth/solana/react`), each a button that signs in with `@synqauth/plugin-siws`. Then a passkey (`@synqauth/plugin-passkey`), and every other way your brand offers on its hosted page.
- `src/synq.config.ts` and `src/app/api/auth/[...synq]/route.ts`: the one configuration and the route mount, which signs people in and out and keeps the session in a sealed, HttpOnly cookie.
- `src/proxy.ts`: refreshes a session that's due, and sends anyone signed out from `/account` to sign in.
- `src/app/account/page.tsx`: who's signed in (`synq.me()`, read on the server), adding a passkey, and signing out.
- `src/lib/session-store.ts`: where sessions live. In their sealed cookie by default, which suits one server process, as `npm run dev` runs. Set `REDIS_URL` for a Redis or Valkey of your own, or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for Upstash, and sessions live there, with one lock per session that every process shares. On Vercel, add Redis (Upstash) from the Marketplace, which sets the variables the Upstash store reads. A host with several processes needs one of the two: `synqAuth()` refuses the cookie there. [Choose a session store](https://docs.synq.build/guides/session-stores) has the others: Cloudflare and Postgres.

## Learn more

- [Sign users in to a Next.js app](https://docs.synq.build/getting-started/nextjs), the guide this example follows
- [Solana wallets](https://docs.synq.build/guides/solana-wallets) and [passkeys](https://docs.synq.build/guides/passkeys)
- [Sign in from your own UI](https://docs.synq.build/guides/own-ui-sign-in)
- The packages: [`@synqauth/nextjs`](https://docs.synq.build/sdk/nextjs), [`@synqauth/plugin-siws`](https://docs.synq.build/sdk/plugin-siws), [`@synqauth/plugin-passkey`](https://docs.synq.build/sdk/plugin-passkey), [`@synqauth/solana`](https://docs.synq.build/sdk/solana)
- [Solana login with Synq](https://synq.build/solana)

## License

MIT
