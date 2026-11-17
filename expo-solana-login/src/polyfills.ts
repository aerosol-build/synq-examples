import { install } from 'react-native-quick-crypto'

// WebCrypto (crypto.subtle and getRandomValues) for @synqauth/react-native.
// index.ts imports this file first, so it runs before any Synq client exists.
install()
