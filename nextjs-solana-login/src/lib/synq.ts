import { synqAuth } from '@synqauth/nextjs'

import { synqConfig } from '../synq.config'

export const synq = synqAuth(synqConfig)
