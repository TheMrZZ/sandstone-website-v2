import React from 'react'
import { config } from 'lib/config'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'
import { fetchDatabase } from 'lib/notion'

export const getStaticProps = async (context) => {
  const rawPageId = context.params.pageId as string

  try {
    if (rawPageId === 'sitemap.xml' || rawPageId === 'robots.txt') {
      return {
        redirect: {
          destination: `/api/${rawPageId}`
        }
      }
    }

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
  database[0].properties.Page.title.toString().toLowerCase()

  const ret = {
    paths: database.map((page) => ({
      params: {
        pageId: page.properties.Page.title[0].plain_text
          .toLowerCase()
          .replace(/ /g, '-')
      }
    })),
    // paths: [],
    fallback: 'blocking'
  }

  console.log(ret.paths)
  return ret
}

export default function NotionDomainDynamicPage(props) {
  return <NotionPage {...props} />
}
