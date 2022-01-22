import { config } from './config'
import * as types from './types'

export const getSiteForDomain = (domain: string): types.Site | null => {
  return {
    domain,
    name: config.name,
    rootNotionPageId: config.rootNotionPageId,
    rootNotionSpaceId: config.rootNotionSpaceId,
    pagesDatabaseId: config.pagesDatabaseId,
    description: config.description
  } as types.Site
}
