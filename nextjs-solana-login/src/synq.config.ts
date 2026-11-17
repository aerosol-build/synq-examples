import { defineSynqConfig } from '@synqauth/nextjs/config'
import { siwsServerPlugin } from '@synqauth/plugin-siws/server'

// One configuration, shared by the route mount (lib/synq.ts) and the proxy.
// SYNQ_ISSUER, SYNQ_CLIENT_ID, SYNQ_CLIENT_SECRET, SYNQ_APP_URL and
// SYNQ_SESSION_SECRET fill in the rest, read on the first request, so
// `next build` needs none of them.
export const synqConfig = defineSynqConfig({
  // Sign In With Solana's server half: it tells the page which issuer and
  // app to ask for a sign-in request. Nothing is verified here: the issuer
  // checks every signature.
  plugins: [siwsServerPlugin()],
})
