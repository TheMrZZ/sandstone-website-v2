import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { IconContext } from 'react-icons'
import crypto from 'crypto'

const cspHashOf = (text) => {
  const hash = crypto.createHash('sha256')
  hash.update(text)
  return `'sha256-${hash.digest('base64')}'`
}

export default class MyDocument extends Document {
  render() {
    let csp = `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; script-src *.cloudflareinsights.com 'self' ${cspHashOf(
      NextScript.getInlineScriptSource(this.props)
    )}`
    if (process.env.NODE_ENV !== 'production') {
      // In development mode, we need unsafe-eval for fast refresh
      csp = `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; script-src *.cloudflareinsights.com 'self' 'unsafe-eval'`
    }

    return (
      <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
        <Html lang='en'>
          <Head>
            <meta httpEquiv='Content-Security-Policy' content={csp} />

            <link rel='shortcut icon' href='/favicon.png' />

            <link
              rel='apple-touch-icon'
              sizes='180x180'
              href='/apple-touch-icon.png'
            />
            <link
              rel='icon'
              type='image/png'
              sizes='96x96'
              href='/favicon-96x96.png'
            />
            <link
              rel='icon'
              type='image/png'
              sizes='32x32'
              href='/favicon-32x32.png'
            />
            <link
              rel='icon'
              type='image/png'
              sizes='16x16'
              href='/favicon-16x16.png'
            />

            <link rel='manifest' href='/manifest.json' />
          </Head>

          <body>
            <script src='/noflash.js' />

            <Main />

            <NextScript />

            {process.env.NODE_ENV === 'production' ? (
              <script
                defer
                src='/api/cgi'
                data-cf-beacon='{"token": "413abc9d06bf48dbb66601382651e5fd"}'
              ></script>
            ) : null}
          </body>
        </Html>
      </IconContext.Provider>
    )
  }
}
