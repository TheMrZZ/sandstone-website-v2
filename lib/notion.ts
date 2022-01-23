import { NotionAPI } from 'notion-client'
import { SearchParams, SearchResults } from 'notion-types'
import { Client } from '@notionhq/client'
import { NotionDatabasePages } from './types'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL
})

export const notionOfficialClient = new Client({
  auth: process.env.NOTION_TOKEN
})

export async function fetchDatabase(databaseId: string) {
  const result: NotionDatabasePages = []

  let cursor: string | undefined

  while (true) {
    const res = await notionOfficialClient.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor
    })

    result.push(...res.results)
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
