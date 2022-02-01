import React from 'react'
import { config } from 'lib/config'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'
import { decompress } from 'compress-json'

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(config.domain)

    return {
      props,
      revalidate: process.env.PREVIEW === 'true' ? 1 : undefined
    }
  } catch (err) {
    console.error('page error', config.domain, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export default function NotionDomainPage(props) {
  const realProps = decompress(props.props)

  return (
    <NotionPage
      {...realProps}
      metaTitle='Sandstone | Next Generation Framework for Minecraft'
    />
  )
}
