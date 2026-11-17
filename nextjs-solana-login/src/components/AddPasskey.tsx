'use client'

import { mountRequest } from '@synqauth/nextjs/client'
import { passkeyPlugin } from '@synqauth/plugin-passkey'

const passkey = passkeyPlugin().actions(mountRequest())

// A fresh sign-in first, then the brand's offer of a passkey: the next
// sign-in can be the passkey alone.
export function AddPasskey() {
  return (
    <a className="button" href={passkey.addUrl({ returnTo: '/account' })}>
      Add a passkey
    </a>
  )
}
