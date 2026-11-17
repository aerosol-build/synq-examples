import { useAuth, useSession, useUser } from '@synqauth/react-native'
import { useConnectedWallet, useWalletSignIn } from '@synqauth/solana-mobile/react-native'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function HomeScreen() {
  const { isLoaded, isSignedIn } = useSession()
  const { user } = useUser()
  const auth = useAuth()
  const wallet = useWalletSignIn()
  const { account } = useConnectedWallet()
  const [problem, setProblem] = useState('')

  // Ask the issuer for the wallet's Sign In With Solana request while the
  // button shows, so the tap goes straight to the wallet app.
  const { prepare } = wallet
  useEffect(() => (isSignedIn ? undefined : prepare()), [isSignedIn, prepare])

  const signInWithWallet = async () => {
    setProblem('')
    // One approval in the wallet app (Seed Vault on Seeker, Phantom,
    // Solflare…), and the session in place: no browser opens.
    const result = await wallet.signIn()
    if (result.error?.code === 'redirect_to_web') {
      // What only the brand's hosted page can finish (a token gate, a
      // step-up) goes on there, in the system browser, at its wallet step.
      const hosted = await auth.signIn({ method: 'wallet' })
      if (hosted.error && hosted.error.code !== 'cancelled') setProblem(hosted.error.code)
      return
    }
    if (result.error) setProblem(result.error.code)
  }

  const signInInBrowser = async () => {
    setProblem('')
    // Passkeys, Google, email and every other way the brand offers, on its
    // hosted page in the system browser.
    const result = await auth.signIn()
    if (result.error && result.error.code !== 'cancelled') setProblem(result.error.code)
  }

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Solana login on Seeker</Text>
      {isSignedIn ? (
        <View style={styles.stack}>
          <Text style={styles.body}>You&apos;re signed in.</Text>
          <Text style={styles.label}>Who you are at the brand</Text>
          <Text style={styles.mono}>{user?.sub}</Text>
          {account && (
            <>
              <Text style={styles.label}>Connected wallet</Text>
              <Text style={styles.mono}>{account.address}</Text>
            </>
          )}
          <Button label="Sign out" onPress={() => void auth.signOut()} />
        </View>
      ) : (
        <View style={styles.stack}>
          <Text style={styles.body}>
            Sign in with the wallet app on this phone, through Mobile Wallet Adapter.
          </Text>
          <Button
            label={wallet.pending ? 'Waiting for your wallet…' : 'Sign in with your wallet'}
            disabled={wallet.pending}
            onPress={() => void signInWithWallet()}
          />
          <Button label="Other ways in" onPress={() => void signInInBrowser()} secondary />
        </View>
      )}
      {problem !== '' && <Text style={styles.problem}>{`Didn't sign in: ${problem}`}</Text>}
    </SafeAreaView>
  )
}

function Button({
  label,
  onPress,
  disabled,
  secondary,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  secondary?: boolean
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (pressed || disabled) && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, gap: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  stack: { gap: 12 },
  body: { fontSize: 16, lineHeight: 24, color: '#111' },
  label: { fontSize: 13, color: '#555' },
  mono: { fontSize: 14, fontFamily: 'monospace', color: '#111' },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#111',
  },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#111' },
  pressed: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  secondaryText: { color: '#111' },
  problem: { fontSize: 14, color: '#b00020' },
})
