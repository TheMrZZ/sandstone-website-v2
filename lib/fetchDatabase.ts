import { SideBarItems } from './types'

export async function fetchDatabase(databaseId: string) {
  if (!process.env.NOTION_TOKEN) {
    throw new Error('Missing NOTION_TOKEN')
  }

  const myHeaders = new Headers()
  myHeaders.append('Authorization', 'Bearer ' + process.env.NOTION_TOKEN)
  myHeaders.append('Notion-Version', '2021-08-16')
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
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

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw
  }

  const response = await fetch(
    'https://api.notion.com/v1/databases/' + databaseId + '/query',
    requestOptions
  )
  const json = await response.json()

  return json.results as SideBarItems
}
