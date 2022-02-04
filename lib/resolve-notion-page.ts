import { Block } from 'notion-types'
import { config } from './config'
import { getSiteForDomain } from './get-site-for-domain'
import { getImageIdFromUrl, isValidUrl, pageToName } from './map-image-url'
import { uploadImageToS3, getDatabase, notion } from './notion'
import { compress } from 'compress-json'

export async function resolveNotionPage(domain: string, pageName?: string) {
  const site = getSiteForDomain(domain)

  const database = await getDatabase(site.pagesDatabaseId)

  const pageId = pageName
    ? database.find((page) => pageToName(page) === pageName)?.id
    : config.rootNotionPageId

  if (!pageId) {
    throw new Error('Failed to find the page corresponding to ' + pageName)
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

  const imageRawURLs = Object.values(recordMap.block)
    .flatMap(({ value }) => {
      if (value?.type === 'image') {
        const url = value.format.display_source

        if (
          !(
            url.startsWith('https://www.notion.so') ||
            url.includes('amazonaws.com')
          )
        ) {
          return undefined
        }

        return {
          url,
          permissionRecord: { table: 'block', id: value.id },
          id: value.id
        }
      }

      return undefined
    })
    .filter((x) => x)

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
      : [])
  ].filter((x) => x)

  await Promise.all([
    ...filesToDownload.map(({ url, id }) => {
      return uploadImageToS3(url, id)
    }),
    notion
      .getSignedFileUrls(imageRawURLs)
      .then(({ signedUrls }) =>
        Promise.all(
          signedUrls.map((url, i) => uploadImageToS3(url, imageRawURLs[i].id))
        )
      )
  ])

  return {
    props: compress({
      site,
      recordMap: recordMap,
      pageId,
      sideBar: database
    })
  }
}
