import { Block } from 'notion-types'
import { config } from './config'
import { getSiteForDomain } from './get-site-for-domain'
import { getImageIdFromUrl, getPageUrl, isValidUrl } from './map-image-url'
import { uploadImageToS3, fetchDatabase, notion } from './notion'
import { uuidToId } from 'notion-utils'
import { compress } from 'compress-json'

export async function resolveNotionPage(domain: string, pageUrl?: string) {
  const site = getSiteForDomain(domain)

  const database = await fetchDatabase(site.pagesDatabaseId)

  const pageId = pageUrl
    ? database.find((page) => getPageUrl(page) === pageUrl)?.id
    : config.rootNotionPageId

  if (!pageId) {
    throw new Error('Failed to find the page corresponding to ' + pageUrl)
  }

  const recordMap = await notion.getPage(pageId)

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
    ...database.map((item) => {
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

  // Clean the record map
  Object.values(recordMap.block).forEach(({ value }) => {
    if (value.type === 'page' && uuidToId(value.id) !== pageId) {
      value.content = []
      value.file_ids = []
      delete value.format.page_cover
    }

    delete (value as any)?.permissions
    delete (value as any)?.format?.collection_pointer
    delete (value as any)?.format?.copied_from_pointer
    delete value?.properties?.source
  })

  // Clean the sidebar
  Object.values(database).forEach(({ properties }) => {
    const p = properties as any
    p.meta_keywords?.multi_select.forEach((x) => {
      delete x.id
      delete x.color
    })
    delete p.meta_keywords?.color

    p.meta_description?.rich_text.forEach((x) => {
      delete x.annotation
      delete x.text
    })
  })

  return {
    props: compress({
      site,
      recordMap: recordMap,
      pageId,
      sideBar: database
    })
  }
}
