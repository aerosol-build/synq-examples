# Synq examples

Working examples of Sign In With Solana, Solana wallet login, Mobile Wallet Adapter on Seeker, and passkeys, built with [Synq](https://synq.build)'s public `@synqauth/*` packages from npm.

| Example                                      | What it shows                                                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`nextjs-solana-login`](nextjs-solana-login) | A Next.js App Router app: Sign In With Solana from the browser's wallets and passkeys on your own page, with `@synqauth/nextjs`. The browser never holds a token.         |
| [`expo-solana-login`](expo-solana-login)     | An Expo app for Android and the Solana Seeker: wallet login through Mobile Wallet Adapter, one approval in the wallet app and no browser, with `@synqauth/solana-mobile`. |

## Quick start

```sh
git clone https://github.com/aerosol-build/synq-examples.git
cd synq-examples/nextjs-solana-login   # or expo-solana-login
cp .env.example .env.local             # .env for the Expo app; fill in your brand and app
npm install
npm run dev                            # npx expo run:android for the Expo app
```

Each example's README says how to make its app in Synq's dashboard first. Every brand and app value comes from that `.env` file, and nothing secret is in this repository.

Each example is its own project, with its own `package-lock.json`: copy one folder out and it runs on its own. CI builds both on every push to `main`.

## Learn more

- [Synq](https://synq.build): customer identity for businesses, with Solana wallet, social, email and passkey sign-in
- [Synq's docs](https://docs.synq.build), from [getting started](https://docs.synq.build/getting-started) to every [package](https://docs.synq.build/sdk)
- [Solana login with Synq](https://synq.build/solana)

## License

MIT
