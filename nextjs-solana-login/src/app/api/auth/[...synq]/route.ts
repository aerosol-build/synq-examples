import { synq } from '../../../../lib/synq'

// Signs people in and out, finishes the callback, and answers the page's
// plugins. The browser never holds a Synq token: the session is a sealed,
// HttpOnly cookie on this app.
export const { GET, POST, PATCH, DELETE } = synq.handlers
