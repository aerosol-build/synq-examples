# Solana wallet login for Expo and Seeker, with Mobile Wallet Adapter

Sign In With Solana in an Expo (React Native) app on Android and the Solana Seeker, through Mobile Wallet Adapter: one approval in the person's wallet app, and a [Synq](https://synq.build) session in place, with no browser.

## Quick start

```sh
git clone https://github.com/aerosol-build/synq-examples.git
cd synq-examples/expo-solana-login
cp .env.example .env         # then fill in your brand's issuer and native app
npm install
npx expo run:android         # on a Seeker, or an Android phone with a wallet app
```

Mobile Wallet Adapter is native code, so the app runs as a development build, not in Expo Go: `npx expo run:android` builds one with the Android SDK, and [EAS Build](https://docs.expo.dev/develop/development-builds/create-a-build/) builds one in the cloud. On a Seeker, the wallet app is Seed Vault Wallet; on any other Android phone, Phantom, Solflare or Backpack.

## Before you run it: your brand and app

1. [Sign up for Synq](https://synq.build), verify your email and make an org. Its first brand signs people in at once, on the free Starter plan.
2. In the dashboard, open the brand's **Apps** and make a **New app**: a Native app, with
   - `com.example.synqlogin:/callback` as a redirect URI, where the system browser brings a sign-in back
   - `https://<your domain>/synq/callback` as a second one: the app's https identity, which wallet apps show
   - `com.example.synqlogin:/signed-out` under **After signing out**
3. Turn on **Sign in from this app's own screens** on the app's page, so the wallet's signature becomes a session in place. Without it, the wallet button goes on at the hosted page's wallet step, in the system browser.
4. Prove the app owns that domain with an [Android App Link](https://developer.android.com/training/app-links/verify-android-applinks): serve `https://<your domain>/.well-known/assetlinks.json` naming `com.example.synqlogin` and your signing certificate's SHA-256. Wallet apps check the app's identity, the Sign In With Solana message names its domain, and Synq answers a wallet's request only from one of the app's own origins. A scheme of its own proves nothing about who owns an app, so with no https identity the wallet layer refuses with `invalid_options` before asking anyone.
5. Fill in `.env`: the brand's issuer, the app's client ID (a native app has no secret) and `https://<your domain>` as `EXPO_PUBLIC_APP_ORIGIN`.

Change `com.example.synqlogin` to your own app's id in `app.config.ts` and `src/config.ts`, and on the app's redirect URIs.

## What it shows

- `index.ts` and `src/polyfills.ts`: WebCrypto from `react-native-quick-crypto`, installed before anything else, since Hermes has none.
- `src/App.tsx`: `createSynqNative` (`@synqauth/react-native`), which signs in through the system browser and keeps the session and its refresh token in the phone's secure storage, and `SynqMobileWalletProvider` (`@synqauth/solana-mobile/react-native`) with Mobile Wallet Adapter's own `transact`. The wallet app's authorization is kept too, so a connected app asks for one approval and no new connect.
- `src/HomeScreen.tsx`: `useWalletSignIn()` signs in with the wallet app in place, asking the issuer for the request before the tap (`prepare`), and goes on in the browser when only the hosted page can finish (`redirect_to_web`). **Other ways in** opens the brand's hosted page for passkeys, email and the rest. Signed in, it shows who you are, the connected wallet, and **Sign out**.

## Learn more

- [Solana wallets: from a native app](https://docs.synq.build/guides/solana-wallets#from-a-native-app)
- [Connected wallets in a React Native app](https://docs.synq.build/guides/connected-wallets#in-a-react-native-app)
- [Sign in from your own UI: React Native](https://docs.synq.build/guides/own-ui-sign-in#react-native)
- The packages: [`@synqauth/solana-mobile`](https://docs.synq.build/sdk/solana-mobile) and [`@synqauth/react-native`](https://docs.synq.build/sdk/react-native)
- [Solana login with Synq](https://synq.build/solana)

## License

MIT
