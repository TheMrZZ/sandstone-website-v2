import { Block } from 'notion-types'
import { config } from './config'

export const mapNotionImageUrl = (url: string, block: Block) => {
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
    url = `https://www.notion.so${url}`
  }

  // more recent versions of notion don't proxy unsplash images
  if (!url.startsWith('https://images.unsplash.com')) {
    url = `https://www.notion.so${url.startsWith('/image') ? url : `/image/${encodeURIComponent(url)}`
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
