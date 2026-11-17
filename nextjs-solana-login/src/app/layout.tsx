import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sign In With Solana and passkeys on Next.js, with Synq',
  description:
    'A Next.js App Router example: Solana wallet login and passkeys with @synqauth/nextjs.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
