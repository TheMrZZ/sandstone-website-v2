import { Block } from 'notion-types'
import { config } from './config'

export const mapNotionImageUrl = (
  url: string,
  block: Block | { parent_table: string; id: string }
) => {
  if (!url) {
    return null
  }

  if (url.startsWith('data:')) {
    return url
  }

  if (config.imageCDNHost && url.startsWith(config.imageCDNHost)) {
    return url
  }

  // const origUrl = url

  if (url.startsWith('/images')) {
    return url
  }

  // If it's from AWS, map it to our own server
  if (url.startsWith('https://www.notion.so') || url.startsWith('https://s3')) {
    const path = '/images/' + getImageIdFromUrl(url)

    // Start the download. By the time someone actually visit the website, the image will be there!
    return path
  }

  // more recent versions of notion don't proxy unsplash images
  if (!url.startsWith('https://images.unsplash.com')) {
    url = `https://www.notion.so${
      url.startsWith('/image') ? url : `/image/${encodeURIComponent(url)}`
    }`

    const notionImageUrlV2 = new URL(url)
    let table = block.parent_table === 'space' ? 'block' : block.parent_table
    if (table === 'collection') {
      table = 'block'
    }
    notionImageUrlV2.searchParams.set('table', table)
    notionImageUrlV2.searchParams.set('id', block.id)
    notionImageUrlV2.searchParams.set('cache', 'v2')

    url = notionImageUrlV2.toString()
  }

  // console.log({ url, origUrl })
  return mapImageUrl(url)
}

export const mapImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith('data:')) {
    return imageUrl
  }

  if (config.imageCDNHost) {
    // Our proxy uses Cloudflare's global CDN to cache these image assets
    return `${config.imageCDNHost}/${encodeURIComponent(imageUrl)}`
  } else {
    return imageUrl
  }
}

export const getImageIdFromUrl = (url: string): string => {
  // Get the before-the-last element
  return new URL(url).pathname.split('/').slice(-2, -1)[0]
}
