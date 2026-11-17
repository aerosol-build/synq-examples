import type { NextConfig } from 'next'

const config: NextConfig = {
  // Cache Components, as create-next-app turns them on for a new app: every
  // part of a page that reads the session does it inside <Suspense>.
  cacheComponents: true,
}

export default config
