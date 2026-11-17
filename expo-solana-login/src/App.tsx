import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { SynqNativeProvider, createSynqNative } from '@synqauth/react-native'
import {
  SynqMobileWalletProvider,
  secureAuthorizationCache,
} from '@synqauth/solana-mobile/react-native'
import * as SecureStore from 'expo-secure-store'
import { StatusBar } from 'expo-status-bar'
import * as WebBrowser from 'expo-web-browser'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { POST_LOGOUT_REDIRECT_URI, REDIRECT_URI, readConfig } from './config'
import { HomeScreen } from './HomeScreen'
import { NotSetUpScreen } from './NotSetUpScreen'

const { config, missing } = readConfig()

// Synq for a native app: sign-in in the system browser (Custom Tabs, never a
// web view) or in place over Mobile Wallet Adapter, with the session and its
// refresh token in the phone's secure storage.
const synq = config
  ? createSynqNative({
      issuer: config.issuer,
      clientId: config.clientId,
      redirectUri: REDIRECT_URI,
      postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
      scope: 'openid profile offline_access',
      webBrowser: WebBrowser,
      secureStore: SecureStore,
    })
  : null

// The wallet app's authorization, kept between launches: a connected app
// asks for one approval, never a new connect.
const authorizationCache = secureAuthorizationCache(SecureStore)

export function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {config && synq ? (
        <SynqNativeProvider synq={synq} issuer={config.issuer}>
          <SynqMobileWalletProvider
            transact={transact}
            appOrigin={config.appOrigin}
            // How the wallet app names the app asking.
            identity={{ name: 'Synq Solana Login', uri: config.appOrigin }}
            authorizationCache={authorizationCache}
          >
            <HomeScreen />
          </SynqMobileWalletProvider>
        </SynqNativeProvider>
      ) : (
        <NotSetUpScreen missing={missing} />
      )}
    </SafeAreaProvider>
  )
}
