import Link from 'next/link'
import { Suspense } from 'react'

import { SignIn } from '../components/SignIn'
import { synq } from '../lib/synq'

export default function Home() {
  return (
    <>
      <h1>Sign In With Solana, and passkeys</h1>
      <p>
        A Next.js App Router app signed in with Synq: a Solana wallet or a passkey from this
        page&apos;s own buttons, and every other way in on the brand&apos;s hosted page.
      </p>
      <Suspense fallback={<p>Checking who is signed in…</p>}>
        <Who />
      </Suspense>
    </>
  )
}

// It reads the session cookie, so it renders inside <Suspense>: the rest of
// the page is prerendered, and this part streams in.
async function Who() {
  const me = await synq.me()
  if (me) {
    return (
      <p>
        You&apos;re signed in. <Link href="/account">Your account</Link>
      </p>
    )
  }
  return <SignIn hostedHref={synq.signInPath({ returnTo: '/account' })} />
}
