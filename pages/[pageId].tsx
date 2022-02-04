import React from 'react'
import { config } from 'lib/config'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'
import { getDatabase } from 'lib/notion'
import { pageToName } from 'lib/map-image-url'
import { decompress } from 'compress-json'

export const getStaticProps = async (context) => {
  const rawPageId = context.params.pageId as string

  try {
    const props = await resolveNotionPage(config.domain, rawPageId)

    return {
      props,
      revalidate: process.env.PREVIEW === 'true' ? 1 : undefined
    }
  } catch (err) {
    console.error('page error', config.domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export async function getStaticPaths() {
  if (config.isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

  const database = await getDatabase(config.pagesDatabaseId)

  const ret = {
    paths: database.map((page) => ({
      params: {
        // Remove the prefix!
        pageId: pageToName(page)
      }
    })),
    fallback: 'blocking'
  }

  return ret
}

export default function NotionDomainDynamicPage({ props }) {
  // For some reasons (??), sometimes during development 'props' will be undefined.
  if (props) {
    const realProps = decompress(props)

    return <NotionPage {...realProps} />
  }

  return null
}
