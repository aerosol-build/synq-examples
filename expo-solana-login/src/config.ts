// Which brand and app this build signs in to, from .env (Expo inlines
// EXPO_PUBLIC_* when it bundles). Nothing here names a Synq host: point the
// same code at a test brand or a live one by changing .env alone.

export interface SynqAppConfig {
  /** The brand's issuer: https://<your brand>.auth.synq.build */
  readonly issuer: string
  /** The native app's client ID. */
  readonly clientId: string
  /** The app's https identity: the origin of an https redirect URI it registered and claims. */
  readonly appOrigin: string
}

/** The app's Synq configuration, or the names of the variables still missing. */
export function readConfig():
  { config: SynqAppConfig; missing: [] } | { config: null; missing: string[] } {
  const issuer = process.env.EXPO_PUBLIC_SYNQ_ISSUER ?? ''
  const clientId = process.env.EXPO_PUBLIC_SYNQ_CLIENT_ID ?? ''
  const appOrigin = process.env.EXPO_PUBLIC_APP_ORIGIN ?? ''
  const missing = [
    ...(issuer ? [] : ['EXPO_PUBLIC_SYNQ_ISSUER']),
    ...(clientId ? [] : ['EXPO_PUBLIC_SYNQ_CLIENT_ID']),
    ...(appOrigin ? [] : ['EXPO_PUBLIC_APP_ORIGIN']),
  ]
  if (missing.length > 0) return { config: null, missing }
  return { config: { issuer, clientId, appOrigin }, missing: [] }
}

/** Where the system browser brings a sign-in back: app.config.ts's scheme. */
export const REDIRECT_URI = 'com.example.synqlogin:/callback'
/** Where it brings a sign-out back. */
export const POST_LOGOUT_REDIRECT_URI = 'com.example.synqlogin:/signed-out'
