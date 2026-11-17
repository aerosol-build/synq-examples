'use client'

import { mountRequest } from '@synqauth/nextjs/client'
import { passkeyPlugin } from '@synqauth/plugin-passkey'
import { siwsPlugin } from '@synqauth/plugin-siws'
import { useSolanaWallets } from '@synqauth/solana/react'
import { useEffect, useState } from 'react'

// Both plugins call this app's own route mount (/api/auth), never Synq: the
// browser never holds a token, and the issuer checks every signature and
// passkey itself.
const request = mountRequest()
const siws = siwsPlugin().actions(request)
const passkey = passkeyPlugin().actions(request)

export function SignIn({ hostedHref }: { hostedHref: string }) {
  // The browser's Solana wallets, through the Wallet Standard: Phantom,
  // Solflare, Backpack and any other wallet that registers itself.
  const wallets = useSolanaWallets()
  const [problem, setProblem] = useState('')

  // Ask the issuer for the Sign In With Solana request while the buttons
  // show, so a tap goes straight to the wallet: Safari opens a wallet's
  // prompt only while the tap still counts.
  useEffect(() => void siws.prepare(), [])

  return (
    <div className="stack">
      {wallets.map((wallet) => (
        <button
          key={wallet.name}
          type="button"
          onClick={() => {
            setProblem('')
            // The wallet signs the issuer's request on this page, and the
            // route mount trades the signature for a session.
            void siws.signIn(wallet, { returnTo: '/account' }).then(({ error }) => {
              if (error) setProblem(`${wallet.name}: ${error.code}`)
            })
          }}
        >
          {`Sign in with ${wallet.name}`}
        </button>
      ))}
      {wallets.length === 0 && (
        <p className="muted">
          No Solana wallet in this browser. Install one, or use the hosted page below: it shows a
          link and a QR code to sign with a wallet on another device.
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          setProblem('')
          // On this page where the app has own-UI sign-in on and the browser
          // can use the brand's passkeys here; else the hosted page's
          // passkey step.
          void passkey.signIn({ returnTo: '/account' }).then(({ data, error }) => {
            if (error) setProblem(`Passkey: ${error.code}`)
            else location.assign(data.signedIn ? data.returnTo : data.url)
          })
        }}
      >
        Sign in with a passkey
      </button>
      <a className="button" href={hostedHref}>
        Other ways in (the brand&apos;s hosted page)
      </a>
      <p role="status">{problem}</p>
    </div>
  )
}
