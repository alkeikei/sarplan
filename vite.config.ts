/// <reference types="vitest/config" />
import { createReadStream, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Where `npm run tiles` puts the archive. Gitignored: it is gigabytes. */
const TILES_FILE = resolve(import.meta.dirname, 'tiles/basemap.pmtiles')
const TILES_PATH = '/tiles/basemap.pmtiles'

/**
 * Serves the basemap archive in development, standing in for the Worker in
 * worker/index.ts.
 *
 * This cannot be a file in public/: pmtiles is a range-request format, and an
 * archive that size would be copied into dist/ on every build. So it lives
 * outside the served tree and this middleware answers the one route.
 */
function pmtilesDevServer(): Plugin {
  return {
    name: 'navsar-pmtiles-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(TILES_PATH, (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next()

        let size: number
        try {
          size = statSync(TILES_FILE).size
        } catch {
          res.statusCode = 404
          res.setHeader('content-type', 'text/plain')
          res.end(
            `No basemap archive at ${TILES_FILE}.\n` +
              'Run `npm run tiles` to download one, or set VITE_PMTILES_URL to a deployed instance.\n',
          )
          return
        }

        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '')
        if (!range) {
          res.statusCode = 416
          res.end()
          return
        }

        // `bytes=-500` is the last 500 bytes, not a range starting at zero.
        const [, rawStart, rawEnd] = range
        const start = rawStart === '' ? size - Number(rawEnd) : Number(rawStart)
        const end = rawStart === '' || rawEnd === '' ? size - 1 : Number(rawEnd)

        if (!(start >= 0) || start > end || end >= size) {
          res.statusCode = 416
          res.setHeader('content-range', `bytes */${size}`)
          res.end()
          return
        }

        res.statusCode = 206
        res.setHeader('content-type', 'application/octet-stream')
        res.setHeader('accept-ranges', 'bytes')
        res.setHeader('content-range', `bytes ${start}-${end}/${size}`)
        res.setHeader('content-length', String(end - start + 1))
        if (req.method === 'HEAD') {
          res.end()
          return
        }
        createReadStream(TILES_FILE, { start, end }).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), pmtilesDevServer()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
