import { SideBarItems } from 'lib/types'
import { uuidToId } from 'notion-utils'
import { config } from 'lib/config'
import React from 'react'
import { cs } from 'react-notion-x'
import { DarkMode } from 'use-dark-mode'
import Link from 'next/link'
import Image from 'next/image'
import { mapNotionImageUrl } from 'lib/map-image-url'

function createItem({
  id,
  pageId,
  level,
  text,
  to
}: {
  id: string
  pageId: string
  level: number
  text: string | React.ReactElement
  to: string
}) {
  return (
    <Link
      href={`/${to.toLowerCase().replace(/ /g, '-')}${
        config.isDev ? '-' + uuidToId(id) : ''
      }`}
      key={id}
    >
      <a
        className={cs(
          'notion-table-of-contents-item',
          `notion-table-of-contents-item-indent-level-${level}`,
          uuidToId(pageId) === uuidToId(id) &&
            'notion-table-of-contents-active-item'
        )}
        style={{
          fontSize: '1em',
          color: 'var(--fg-color)'
        }}
      >
        <span
          className='notion-table-of-contents-item-body'
          style={{
            display: 'inline-block',
            marginLeft: level * 16
          }}
        >
          {text}
        </span>
      </a>
    </Link>
  )
}

function textWithIcon(
  icon:
    | { type: 'emoji'; emoji: string }
    | { type: 'file'; file: { url: string } },
  text: string,
  id: string
) {
  if (icon.type === 'emoji') {
    return `${icon.emoji} ${text}`
  }

  const url = mapNotionImageUrl(icon.file.url, {
    parent_table: 'collection',
    id
  })

  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Image src={url} width={20} height={20} />
      <span
        style={{
          height: '100%',
          paddingLeft: '0.4em'
        }}
      >
        {text}
      </span>
    </span>
  )
}

export const SideBar: React.FC<{
  pageId: string
  darkMode: DarkMode
  sideBar: SideBarItems
}> = ({ pageId, darkMode, sideBar }) => {
  const categories = [
    ...new Set(
      sideBar.map((item) => {
        return item.properties.Category.select.name
      })
    )
  ].sort()

  const pagesByCategory = categories.reduce((acc, category) => {
    acc[category] = sideBar.filter(
      (item) => item.properties.Category.select.name === category
    )
    return acc
  }, {} as { [key: string]: SideBarItems })

  return (
    <div className='notion-aside-table-of-contents'>
      <div
        className='notion-aside-table-of-contents-header'
        style={{
          textTransform: 'none',
          fontSize: '1.3em',
          marginBottom: '1em'
        }}
      >
        Navigation
      </div>

      <nav
        className={cs(
          'notion-table-of-contents',
          !darkMode.value && 'notion-gray'
        )}
      >
        {categories.map((category) => {
          return [
            createItem({
              // Clicking on the category puts to the 1st page
              id: pagesByCategory[category][0].id,
              pageId: '',
              level: 0,
              text: category.slice(4),
              to: pagesByCategory[category][0].properties.Page.title[0]
                .plain_text
            }),
            ...pagesByCategory[category].map((item) => {
              return createItem({
                id: item.id,
                pageId,
                level: 1,
                text: textWithIcon(
                  item.icon,
                  item.properties.Page.title[0].plain_text,
                  item.id
                ),
                to: item.properties.Page.title[0].plain_text
              })
            })
          ]
        })}
      </nav>
    </div>
  )
}
