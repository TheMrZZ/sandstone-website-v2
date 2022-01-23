import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import { SearchParams, SearchResults } from 'notion-types'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL
})

export const notionOfficialClient = new Client({
  auth: process.env.NOTION_API_KEY
})

export async function search(params: SearchParams): Promise<SearchResults> {
  return notion.search(params)
}
