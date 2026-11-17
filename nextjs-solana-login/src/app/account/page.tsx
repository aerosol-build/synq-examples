import { Suspense } from 'react'

import { AddPasskey } from '../../components/AddPasskey'
import { synq } from '../../lib/synq'

// proxy.ts sends anyone without a session from here to sign in.
export default function Account() {
  return (
    <>
      <h1>Your account</h1>
      <Suspense fallback={<p>Checking who is signed in…</p>}>
        <Who />
      </Suspense>
    </>
  )
}

async function Who() {
  const me = await synq.me()
  if (!me) return <p>Signed out.</p>
  return (
    <>
      <dl>
        <dt>Who you are at the brand</dt>
        <dd>
          <code>{me.sub}</code>
        </dd>
        <dt>How you signed in</dt>
        <dd>{me.amr?.join(', ') ?? 'unknown'}</dd>
      </dl>
      <div className="stack">
        <AddPasskey />
        <form method="post" action={synq.signOutPath}>
          <button type="submit">Sign out</button>
        </form>
      </div>
    </>
  )
}
