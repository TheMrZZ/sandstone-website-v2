import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

export default (req: NextApiRequest, res: NextApiResponse) => {
  return fetch('https://static.cloudflareinsights.com/beacon.min.js').then(
    (script) =>
      script.text().then((data) => {
        res.setHeader('Content-Type', script.headers.get('Content-Type'))
        res.setHeader('Cache-Control', `public, max-age=${604800}`)
        res
          .status(200)
          .send(
            Buffer.from(data.replace('https://cloudflareinsights.com/', '/'))
          )
      })
  )
}
