import { synqProxy } from '@synqauth/nextjs/proxy'

import { synqConfig } from './synq.config'

// Refreshes a session that's due before a page renders, and sends anyone
// without one from /account to sign in.
export const proxy = synqProxy(synqConfig, { protect: ['/account'] })

// Pages only: not Next's files, nor anything with an extension.
export const config = { matcher: ['/((?!_next/|.*\\..*).*)'] }
