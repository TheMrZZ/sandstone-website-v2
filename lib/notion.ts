import { Client } from '@notionhq/client'
import fs from 'fs'
import https from 'https'
import { NotionAPI } from 'notion-client'
import { SearchParams, SearchResults } from 'notion-types'
import { SideBarItems } from './types'

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

export async function downloadImage(url: string, filepath: string) {
  if (fs.existsSync(filepath)) {
    return Promise.resolve(filepath)
  }

  return new Promise<string>((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res
          .pipe(fs.createWriteStream(filepath))
          .on('error', reject)
          .once('close', () => resolve(filepath))
      } else {
        // Consume response data to free up memory
        res.resume()
        reject(
          new Error(`Request Failed With a Status Code: ${res.statusCode}`)
        )
      }
    })
  })
}
