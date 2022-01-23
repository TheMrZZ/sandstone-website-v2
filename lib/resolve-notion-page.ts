import { ExtendedRecordMap } from 'notion-types'
import { parsePageId } from 'notion-utils'
import * as acl from './acl'
import { config } from './config'
import { fetchDatabase } from './fetchDatabase'
import { getSiteForDomain } from './get-site-for-domain'
import { getSiteMaps } from './get-site-maps'
import { notion } from './notion'
import * as types from './types'

const { pageUrlAdditions, pageUrlOverrides } = config

export async function resolveNotionPage(domain: string, rawPageId?: string) {
  const site: types.Site = getSiteForDomain(domain)
  let pageId: string
  let recordMap: ExtendedRecordMap
  let sideBar: types.SideBarItems = null

  if (rawPageId && rawPageId !== 'index') {
    pageId = parsePageId(rawPageId)

    if (!pageId) {
      // check if the site configuration provides an override of a fallback for
      // the page's URI
      const override =
        pageUrlOverrides[rawPageId] || pageUrlAdditions[rawPageId]

      if (override) {
        pageId = parsePageId(override)
      }
    }

    if (pageId) {
      const resources = await Promise.all([
        notion.getPage(pageId),
        fetchDatabase(config.pagesDatabaseId)
      ])

      recordMap = resources[0]
      sideBar = resources[1]
    } else {
      // handle mapping of user-friendly canonical page paths to Notion page IDs
      // e.g., /developer-x-entrepreneur versus /71201624b204481f862630ea25ce62fe
      const siteMaps = await getSiteMaps()
      const siteMap = siteMaps[0]
      pageId = siteMap?.canonicalPageMap[rawPageId]

      if (pageId) {
        // TODO: we're not re-using the site from siteMaps because it is
        // cached aggressively
        // site = await getSiteForDomain(domain)
        // recordMap = siteMap.pageMap[pageId]
        const resources = await Promise.all([
          notion.getPage(pageId),
          fetchDatabase(config.pagesDatabaseId)
        ])

        recordMap = resources[0]
        sideBar = resources[1]
      } else {
        return {
          error: {
            message: `Not found "${rawPageId}"`,
            statusCode: 404
          }
        }
      }
    }
  } else {
    pageId = site.rootNotionPageId

    console.log(site)
    recordMap = await notion.getPage(pageId)
  }

  const props = { site, recordMap, pageId, sideBar }
  return { ...props, ...(await acl.pageAcl(props)) }
}
