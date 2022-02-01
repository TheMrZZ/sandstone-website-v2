import { Client } from '@notionhq/client'

const client = new Client({} as any)

async function x() {
  const res = await client.search({})
  const page = res.results[0]
  console.log(page.parent)
  if (page.object === 'page') {
    page.parent
  }
}
