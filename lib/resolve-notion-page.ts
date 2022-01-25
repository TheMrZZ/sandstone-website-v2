import path from 'path'
import { config } from './config'
import { getSiteForDomain } from './get-site-for-domain'
import { getSiteMaps } from './get-site-maps'
import { mapNotionImageUrl } from './map-image-url'
import { downloadFile, fetchDatabase, notion } from './notion'

const { pageUrlAdditions, pageUrlOverrides } = config

async function getPageId(rawPageId: string | undefined) {
  if (rawPageId && rawPageId !== 'index') {
    const pageId =
      pageUrlOverrides[rawPageId] ??
      pageUrlAdditions[rawPageId] ??
      (await getSiteMaps())[0]?.canonicalPageMap[rawPageId]

    if (pageId) {
      return pageId
    }

    throw new Error(`Could not find pageId for ${rawPageId}`)
  }

  return config.rootNotionPageId
}

export async function resolveNotionPage(domain: string, rawPageId?: string) {
  const site = getSiteForDomain(domain)

  const pageId = await getPageId(rawPageId)

  const [recordMap, sideBar] = await Promise.all([
    notion.getPage(pageId),
    fetchDatabase(site.pagesDatabaseId)
  ])

  return { site, recordMap, pageId, sideBar }
}
