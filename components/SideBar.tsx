import { SideBarItems } from 'lib/types'
import { uuidToId } from 'notion-utils'
import { config } from 'lib/config'
import React from 'react'
import { cs } from 'react-notion-x'
import { DarkMode } from 'use-dark-mode'

function createItem({
  id,
  pageId,
  level,
  text, to
}: {
  id: string
  pageId: string
  level: number
  text: string
  to: string
}) {
  return (
    <a
      key={id}
      href={`/${to.toLowerCase().replace(/ /g, '-')}${config.isDev ? '-' + uuidToId(id) : ''}`}
      className={cs(
        'notion-table-of-contents-item',
        `notion-table-of-contents-item-indent-level-${level}`,
        uuidToId(pageId) === uuidToId(id) &&
          'notion-table-of-contents-active-item'
      )}
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
      <div className='notion-aside-table-of-contents-header'>
        Table of Contents
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
              to: pagesByCategory[category][0].properties.Page.title[0].plain_text
            }),
            ...pagesByCategory[category].map((item) => {
              return createItem({
                id: item.id,
                pageId,
                level: 1,
                text: `${item.icon.emoji} ${item.properties.Page.title[0].plain_text}`,
                to: item.properties.Page.title[0].plain_text
              })
            })
          ]
        })}
      </nav>
    </div>
  )
}
