/**
 * Site-wide app configuration.
 *
 * This file pulls from the root "site.config.js" as well as environment variables
 * for optional depenencies.
 */

import { parsePageId } from 'notion-utils'
import { getEnv, getSiteConfig } from './get-config-value'
import { PageUrlOverridesInverseMap, PageUrlOverridesMap } from './types'

class Config {
  rootNotionPageId = parsePageId(getSiteConfig('rootNotionPageId'), {
    uuid: false
  })

  pagesDatabaseId = parsePageId(getSiteConfig('pagesDatabaseId'), {
    uuid: false
  })

  rootNotionSpaceId = parsePageId(getSiteConfig('rootNotionSpaceId', null), {
    uuid: true
  }) as string | null

  pageUrlOverrides = cleanPageUrlMap(
    getSiteConfig('pageUrlOverrides', {}) || {},
    'pageUrlOverrides'
  )

  inversePageUrlOverrides = invertPageUrlOverrides(this.pageUrlOverrides)

  fontFamily = getSiteConfig('fontFamily', null as string | undefined)

  pageUrlAdditions = cleanPageUrlMap(
    getSiteConfig('pageUrlAdditions', {}) || {},
    'pageUrlAdditions'
  )

  name: string = getSiteConfig('name')
  author: string = getSiteConfig('author')
  domain: string = getSiteConfig('domain')
  description: string = getSiteConfig('description', 'Notion Blog')

  // social accounts
  twitter: string | null = getSiteConfig('twitter', null)
  github: string | null = getSiteConfig('github', null)
  linkedin: string | null = getSiteConfig('linkedin', null)

  socialImageTitle: string | null = getSiteConfig('socialImageTitle', null)

  socialImageSubtitle: string | null = getSiteConfig(
    'socialImageSubtitle',
    null
  )

  // default notion values for site-wide consistency (optional; may be overridden on a per-page basis)
  defaultPageIcon: string | null = getSiteConfig('defaultPageIcon', null)

  defaultPageCover: string | null = getSiteConfig('defaultPageCover', null)

  defaultSocialImage: string | null = getSiteConfig('defaultSocialImage', null)

  defaultPageCoverPosition: number = getSiteConfig(
    'defaultPageCoverPosition',
    0.5
  )

  // Optional utteranc.es comments via GitHub issue comments
  utterancesGitHubRepo: string | null = getSiteConfig(
    'utterancesGitHubRepo',
    null
  )

  // Optional image CDN host to proxy all image requests through
  imageCDNHost: string | null = getSiteConfig('imageCDNHost', null)

  // Optional whether or not to enable support for LQIP preview images
  // (requires a Google Firebase collection)
  isPreviewImageSupportEnabled: boolean = getSiteConfig(
    'isPreviewImageSupportEnabled',
    false
  )
  // general site config

  isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

  // where it all starts -- the site's root Notion page
  includeNotionIdInUrls: boolean = getSiteConfig(
    'includeNotionIdInUrls',
    !!this.isDev
  )

  // ----------------------------------------------------------------------------

  isServer = typeof window === 'undefined'

  port = getEnv('PORT', '3000')
  host = this.isDev ? `http://localhost:${this.port}` : `https://${this.domain}`

  // ----------------------------------------------------------------------------

  fathomId = this.isDev ? null : process.env.NEXT_PUBLIC_FATHOM_ID

  fathomConfig = this.fathomId
    ? {
        excludedDomains: ['localhost', 'localhost:3000']
      }
    : undefined

  defaultEnvValueForPreviewImageSupport =
    this.isPreviewImageSupportEnabled && this.isServer ? undefined : null

  googleProjectId = getEnv(
    'GCLOUD_PROJECT',
    this.defaultEnvValueForPreviewImageSupport
  )

  firebaseCollectionImages = getEnv(
    'FIREBASE_COLLECTION_IMAGES',
    this.defaultEnvValueForPreviewImageSupport
  )

  // this hack is necessary because vercel doesn't support secret files so we need to encode our google
  // credentials a base64-encoded string of the JSON-ified content
  getGoogleApplicationCredentials = () => {
    if (!this.isPreviewImageSupportEnabled || !this.isServer) {
      return null
    }

    try {
      const googleApplicationCredentialsBase64 = getEnv(
        'GOOGLE_APPLICATION_CREDENTIALS',
        this.defaultEnvValueForPreviewImageSupport
      )

      return JSON.parse(
        Buffer.from(googleApplicationCredentialsBase64, 'base64').toString()
      )
    } catch (err) {
      console.error(
        'Firebase config error: invalid "GOOGLE_APPLICATION_CREDENTIALS" should be base64-encoded JSON\n'
      )

      throw err
    }
  }

  googleApplicationCredentials = this.getGoogleApplicationCredentials()
}

function cleanPageUrlMap(
  pageUrlMap: PageUrlOverridesMap,
  label: string
): PageUrlOverridesMap {
  return Object.keys(pageUrlMap).reduce((acc, uri) => {
    const pageId = pageUrlMap[uri]
    const uuid = parsePageId(pageId, { uuid: false })

    if (!uuid) {
      throw new Error(`Invalid ${label} page id "${pageId}"`)
    }

    if (!uri) {
      throw new Error(`Missing ${label} value for page "${pageId}"`)
    }

    if (!uri.startsWith('/')) {
      throw new Error(
        `Invalid ${label} value for page "${pageId}": value "${uri}" should be a relative URI that starts with "/"`
      )
    }

    const path = uri.slice(1)

    return {
      ...acc,
      [path]: uuid
    }
  }, {})
}

function invertPageUrlOverrides(
  pageUrlOverrides: PageUrlOverridesMap
): PageUrlOverridesInverseMap {
  return Object.keys(pageUrlOverrides).reduce((acc, uri) => {
    const pageId = pageUrlOverrides[uri]

    return {
      ...acc,
      [pageId]: uri
    }
  }, {})
}

export const config = new Config()
