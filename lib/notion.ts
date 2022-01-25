import { NotionAPI } from 'notion-client'
import { SearchParams, SearchResults } from 'notion-types'
import { Client } from '@notionhq/client'
import { SideBarItems } from './types'

import https from 'https'
import fs from 'fs'
import { Transform as TransformStream } from 'stream'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL
})

export const notionOfficialClient = new Client({
  auth: process.env.NOTION_TOKEN
})

export async function fetchDatabase(databaseId: string): Promise<SideBarItems> {
  const result: SideBarItems = []

  let cursor: string | undefined

  while (true) {
    const res = await notionOfficialClient.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor,
      sorts: [
        {
          property: 'Category',
          direction: 'ascending'
        },
        {
          property: 'Index',
          direction: 'ascending'
        }
      ]
    })

    result.push(...(res.results as unknown as SideBarItems))
    cursor = res.next_cursor
    if (!res.has_more) {
      break
    }
  }

  return result
}

export async function search(params: SearchParams): Promise<SearchResults> {
  return notion.search(params)
}
