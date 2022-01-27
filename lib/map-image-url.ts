import { config } from './config'

export const mapNotionImageUrl = (url: string) => {
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
  if (
    url.startsWith('https://www.notion.so') ||
    url.includes('amazonaws.com')
  ) {
    const path = 'https://images.sandstone.dev/' + getImageIdFromUrl(url)

    return path
  }

  return url
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
  try {
    return new URL(url).pathname.split('/').slice(-2, -1)[0]
  } catch (e) {
    console.log('='.repeat(20))
    console.log(url)
    console.log('='.repeat(20))
  }
}

export const isValidUrl = (url: string) => {
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}
