// WebCrypto first, before anything makes a Synq client: Hermes has none, and
// @synqauth/react-native needs crypto.subtle for PKCE and the ID token's check.
import './src/polyfills'

import { registerRootComponent } from 'expo'

import { App } from './src/App'

registerRootComponent(App)
