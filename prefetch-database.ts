/* eslint-disable import/first */
// This is used before the build step of Next, to avoid using Notion's API for database pages each time a page is built.
import { config as configDotenv } from 'dotenv'

configDotenv({
  path: '.env.local'
})

import { fetchDatabase } from './lib/notion'
import config from './site.config'
import fs from 'fs'

fetchDatabase(config.pagesDatabaseId).then((database) => {
  fs.writeFileSync('./database.json', JSON.stringify(database))
})
