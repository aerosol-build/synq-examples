import type { ExpoConfig } from 'expo/config'

// The app's https identity (EXPO_PUBLIC_APP_ORIGIN, from .env): wallet apps
// show it and check it, and the Sign In With Solana message names its domain.
// The App Link below lets Android verify that this app owns it, against
// https://<that domain>/.well-known/assetlinks.json.
const appOrigin = process.env.EXPO_PUBLIC_APP_ORIGIN
const host = appOrigin ? new URL(appOrigin).host : null

const config: ExpoConfig = {
  name: 'Synq Solana Login',
  slug: 'synq-expo-solana-login',
  version: '1.0.0',
  // Where the system browser brings a sign-in back: com.example.synqlogin:/callback.
  scheme: 'com.example.synqlogin',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  android: {
    package: 'com.example.synqlogin',
    ...(host
      ? {
          intentFilters: [
            {
              action: 'VIEW',
              autoVerify: true,
              data: [{ scheme: 'https', host, pathPrefix: '/synq' }],
              category: ['BROWSABLE', 'DEFAULT'],
            },
          ],
        }
      : {}),
  },
  plugins: ['expo-secure-store', 'expo-web-browser'],
}

export default config
