// const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const withPreact = require('next-plugin-preact')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withPreact(withBundleAnalyzer({
  images: {
    domains: ['pbs.twimg.com', 's3.us-west-2.amazonaws.com', 'www.notion.so', 'images.sandstone.dev'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  swcMinify: true,

  trailingSlash: true,

  webpack(config, { isServer }) {
    if (!isServer) {
      // Ensure "katex", the equation module, is not included in the client bundle
      config.module.rules.push({
        test: /(katex|snap.svg-cjs|scheduler)/,
        use: "null-loader",
      })
    }
    return config
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        }, {
          key: 'X-Frame-Options',
          value: 'DENY'
        }]
      }
    ]
  }
}))