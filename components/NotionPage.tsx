import cs from 'classnames'
import { config } from 'lib/config'
import { getPageDescription } from 'lib/get-page-description'
import { mapNotionImageUrl } from 'lib/map-image-url'
import { getCanonicalPageUrl, mapPageUrl } from 'lib/map-page-url'
import * as types from 'lib/types'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PageBlock } from 'notion-types'
// utils
import { getBlockTitle } from 'notion-utils'
import * as React from 'react'
import BodyClassName from 'react-body-classname'
import { slide as BurgerMenu } from 'react-burger-menu'
import { FaTimes } from 'react-icons/fa'
// core notion renderer
import { Code, Collection, CollectionRow, NotionRenderer } from 'react-notion-x'
import { useSearchParam } from 'react-use'
import useDarkMode from 'use-dark-mode'
// components
import { CustomFont } from './CustomFont'
import { Footer } from './Footer'
import { GitHubShareButton } from './GitHubShareButton'
import { Header } from './Header'
import { Loading } from './Loading'
import { Page404 } from './Page404'
import { PageHead } from './PageHead'
import { PageSocial } from './PageSocial'
import { ReactUtterances } from './ReactUtterances'
import { SideBar } from './SideBar'
import styles from './styles.module.css'

// const Code = dynamic(() =>
//   import('react-notion-x').then((notion) => notion.Code)
// )
//
// const Collection = dynamic(() =>
//   import('react-notion-x').then((notion) => notion.Collection)
// )
//
// const CollectionRow = dynamic(
//   () => import('react-notion-x').then((notion) => notion.CollectionRow),
//   {
//     ssr: false
//   }
// )

// TODO: PDF support via "react-pdf" package has numerous troubles building
// with next.js
// const Pdf = dynamic(
//   () => import('react-notion-x').then((notion) => notion.Pdf),
//   { ssr: false }
// )

const Equation = dynamic(() =>
  import('react-notion-x').then((notion) => notion.Equation)
)

const Modal = dynamic(
  () => import('react-notion-x').then((notion) => notion.Modal),
  { ssr: false }
)

export const NotionPage: React.FC<types.PageProps> = ({
  site,
  recordMap,
  error,
  pageId,
  sideBar
}) => {
  const router = useRouter()
  const lite = useSearchParam('lite')

  const params: any = {}
  if (lite) params.lite = lite

  // lite mode is for oembed
  const isLiteMode = lite === 'true'
  const searchParams = new URLSearchParams(params)

  const darkMode = useDarkMode(true, { classNameDark: 'dark-mode' })

  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = React.useState(false)

  if (router.isFallback) {
    return <Loading />
  }

  const keys = Object.keys(recordMap?.block || {})
  const block = recordMap?.block?.[keys[0]]?.value

  if (error || !site || !keys.length || !block) {
    return <Page404 site={site} pageId={pageId} error={error} />
  }

  const title = getBlockTitle(block, recordMap) || site.name

  if (!config.isServer) {
    // add important objects to the window global for easy debugging
    const g = window as any
    g.pageId = pageId
    g.recordMap = recordMap
    g.block = block
  }

  const siteMapPageUrl = mapPageUrl(site, recordMap, searchParams)

  const canonicalPageUrl =
    !config.isDev && getCanonicalPageUrl(site, recordMap)(pageId)

  // const isRootPage =
  //   parsePageId(block.id) === parsePageId(site.rootNotionPageId)
  const isBlogPost =
    block.type === 'page' && block.parent_table === 'collection'
  const minTableOfContentsItems = 0

  const socialImage = mapNotionImageUrl(
    (block as PageBlock).format?.page_cover || config.defaultPageCover,
    block
  )

  const socialDescription =
    getPageDescription(block, recordMap) ?? config.description

  let comments: React.ReactNode = null
  let pageAside: React.ReactChild = null

  const navigationMenu = (
    <SideBar sideBar={sideBar} darkMode={darkMode} pageId={pageId}></SideBar>
  )

  // only display comments and page actions on blog post pages
  if (isBlogPost) {
    if (config.utterancesGitHubRepo) {
      comments = (
        <ReactUtterances
          repo={config.utterancesGitHubRepo}
          issueMap='issue-term'
          issueTerm='title'
          theme={darkMode.value ? 'photon-dark' : 'github-light'}
        />
      )
    }

    pageAside = navigationMenu
  } else {
    pageAside = <PageSocial />
  }

  return (
    <>
      <PageHead site={site} />

      <Head>
        <meta property='og:title' content={title} />
        <meta property='og:site_name' content={site.name} />

        <meta name='twitter:title' content={title} />
        <meta property='twitter:domain' content={site.domain} />

        {config.twitter && (
          <meta name='twitter:creator' content={`@${config.twitter}`} />
        )}

        {socialDescription && (
          <>
            <meta name='description' content={socialDescription} />
            <meta property='og:description' content={socialDescription} />
            <meta name='twitter:description' content={socialDescription} />
          </>
        )}

        {socialImage ? (
          <>
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:image' content={socialImage} />
            <meta property='og:image' content={socialImage} />
          </>
        ) : (
          <meta name='twitter:card' content='summary' />
        )}

        {canonicalPageUrl && (
          <>
            <link rel='canonical' href={canonicalPageUrl} />
            <meta property='og:url' content={canonicalPageUrl} />
            <meta property='twitter:url' content={canonicalPageUrl} />
          </>
        )}

        <title>{title}</title>
      </Head>

      <style jsx global>{`
        :global(html) {
          font-size: 10px;
          background: ${darkMode.value ? '#2f3437' : '#fff'};
        }
      `}</style>

      <CustomFont site={site} />

      {isLiteMode && <BodyClassName className='notion-lite' />}

      <div id='outer-container'>
        <BurgerMenu
          pageWrapId={'page-wrap'}
          outerContainerId={'outer-container'}
          width={'250px'}
          isOpen={isBurgerMenuOpen}
          customBurgerIcon={false}
          onOpen={() => setIsBurgerMenuOpen(true)}
          onClose={() => setIsBurgerMenuOpen(false)}
          styles={{
            bmCrossButton: {
              width: '12px'
            }
          }}
          customCrossIcon={<FaTimes fill='var(--fg-color)' />}
        >
          <div
            className='cross-button'
            style={{
              height: '100%',
              background: 'var(--bg-color-1)',
              color: 'var(--fg-color)',
              padding: '10px',
              paddingTop: '2rem',
              fontSize: '1rem'
            }}
          >
            {navigationMenu}
          </div>
        </BurgerMenu>

        <div id='page-wrap'>
          <NotionRenderer
            bodyClassName={cs(
              styles.notion,
              pageId === site.rootNotionPageId && 'index-page'
            )}
            components={{
              pageLink: ({
                href,
                as,
                passHref,
                replace,
                scroll,
                shallow,
                locale,
                ...props
              }) => (
                <Link
                  href={href}
                  as={as}
                  passHref={passHref}
                  replace={replace}
                  scroll={scroll}
                  shallow={shallow}
                  locale={locale}
                >
                  <a {...props} />
                </Link>
              ),
              code: Code,
              collection: Collection,
              collectionRow: CollectionRow,
              modal: Modal,
              equation: Equation,
              image: Image
            }}
            recordMap={recordMap}
            rootPageId={site.rootNotionPageId}
            fullPage={!isLiteMode}
            darkMode={darkMode.value}
            previewImages={site.previewImages !== false}
            showCollectionViewDropdown={false}
            showTableOfContents={false}
            minTableOfContentsItems={minTableOfContentsItems}
            defaultPageIcon={config.defaultPageIcon}
            defaultPageCover={config.defaultPageCover}
            defaultPageCoverPosition={config.defaultPageCoverPosition}
            mapPageUrl={siteMapPageUrl}
            mapImageUrl={mapNotionImageUrl}
            pageFooter={comments}
            pageAside={pageAside}
            header={(props: any) => Header({ ...props, setIsBurgerMenuOpen })}
            footer={
              <Footer
                isDarkMode={darkMode.value}
                toggleDarkMode={darkMode.toggle}
              />
            }
          />

          <GitHubShareButton />
        </div>
      </div>
    </>
  )
}
