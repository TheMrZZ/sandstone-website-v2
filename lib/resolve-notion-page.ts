import { Block } from 'notion-types'
import { config } from './config'
import { getSiteForDomain } from './get-site-for-domain'
import { getSiteMaps } from './get-site-maps'
import { getImageIdFromUrl, isValidUrl } from './map-image-url'
import { uploadImageToS3, fetchDatabase, notion } from './notion'

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

  const page = recordMap.block[Object.keys(recordMap.block)[0]]
    .value as Block & { type: 'page' }

  const collectionId = page.parent_id
  const collection = recordMap.collection[collectionId]?.value

  // Hide all properties of database pages
  if (collection) {
    const propertiesNames = new Set(Object.keys(collection.schema))
    propertiesNames.delete('title')

    collection.format.property_visibility = [...propertiesNames].map((p) => ({
      property: p,
      visibility: 'hide'
    }))
  }

  const filesToDownload = [
    ...sideBar.map((item) => {
      if (item?.icon?.type === 'file') {
        const { url } = item.icon.file
        const id = getImageIdFromUrl(url)
        return { url, id }
      }
      return undefined
    }),

    // Fetch the logo of the page
    ...(isValidUrl(page.format.page_icon)
      ? (
          await notion.getSignedFileUrls([
            {
              url: page.format.page_icon,
              permissionRecord: { table: 'block', id: page.id }
            }
          ])
        ).signedUrls.map((url) => ({
          url,
          id: getImageIdFromUrl(page.format.page_icon!)
        }))
      : []),

    // Fetch all images
    ...(await Promise.all(
      Object.values(recordMap.block).flatMap(async ({ value }) => {
        if (value?.type === 'image') {
          const url = value.format.display_source

          if (
            !(
              url.startsWith('https://www.notion.so') ||
              url.includes('amazonaws.com')
            )
          ) {
            return
          }

          const { signedUrls } = await notion.getSignedFileUrls([
            {
              url,
              permissionRecord: { table: 'block', id: value.id }
            }
          ])

          return signedUrls.map((signedUrl) => ({
            url: signedUrl,
            id: getImageIdFromUrl(url)
          }))[0]
        }
      })
    ))
  ].filter((x) => x)

  await Promise.all(
    filesToDownload.map(({ url, id }) => {
      return uploadImageToS3(url, id)
    })
  )

  return { site, recordMap, pageId, sideBar }
}
