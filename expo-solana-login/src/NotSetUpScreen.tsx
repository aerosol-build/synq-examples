import { StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shown until .env names the brand and the app: copy .env.example to .env,
// fill it in, and start the app again.
export function NotSetUpScreen({ missing }: { missing: readonly string[] }) {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Almost there</Text>
      <Text style={styles.body}>
        Copy .env.example to .env, fill it in with your brand&apos;s issuer and your native app, and
        start the app again. Still missing:
      </Text>
      {missing.map((name) => (
        <Text key={name} style={styles.mono}>
          {name}
        </Text>
      ))}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, gap: 12, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  body: { fontSize: 16, lineHeight: 24, color: '#111' },
  mono: { fontSize: 14, fontFamily: 'monospace', color: '#111' },
})
