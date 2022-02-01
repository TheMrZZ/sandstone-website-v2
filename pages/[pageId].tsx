import React from 'react'
import { config } from 'lib/config'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'
import { fetchDatabase } from 'lib/notion'
import { getPageUrl } from 'lib/map-image-url'
import { decompress } from 'lib/decompress'

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

  const database = await fetchDatabase(config.pagesDatabaseId)

  const ret = {
    paths: database.map((page) => ({
      params: {
        pageId: getPageUrl(page)
      }
    })),
    fallback: 'blocking'
  }

  return ret
}

export default function NotionDomainDynamicPage(props) {
  console.time('Time to decompress')
  const realProps = decompress(props.props)
  console.timeEnd('Time to decompress')

  return <NotionPage {...realProps} />
}
