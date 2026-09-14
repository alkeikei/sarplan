/**
 * The Worker.
 *
 * Two jobs. Everything under /tiles/ is the Protomaps basemap archive, read
 * out of R2 a byte range at a time; everything else is the built SPA, handed
 * straight to the static-asset binding.
 *
 * Why the archive is not a static asset: it is measured in gigabytes and
 * Workers static assets cap at 25 MB per file. R2 is also the point — it has
 * no egress charge, so a basemap everyone can access stays free to serve.
 *
 * Why it is served from this origin rather than a public R2 URL: the map then
 * has exactly the availability the app has. If these bytes are unreachable,
 * the page that would have drawn them did not load either, so there is no
 * partial failure where the app runs with no map under it. It also keeps the
 * tiles same-origin, which the PDF export depends on — a cross-origin read
 * taints the canvas html2canvas rasterises.
 */

/**
 * PMTiles is a range-request format: the client reads a header, then a
 * directory, then individual tiles, all out of one file. Whole-file GETs are
 * never what the map wants and would move gigabytes, so they are refused.
 */
const MAX_RANGE_BYTES = 8 * 1024 * 1024;

/**
 * A day. Long enough that a session costs one revalidation, short enough that
 * a re-uploaded archive reaches users the next day without a purge. The ETag
 * does the real work: the pmtiles reader carries it on every request and
 * re-reads its directories if it changes mid-session.
 */
const CACHE_SECONDS = 86400;

export interface Env {
  /** R2 bucket holding the .pmtiles archive. */
  TILES: R2Bucket;
  /** Built SPA in ./dist. */
  ASSETS: Fetcher;
  /** Object key of the archive within the bucket. */
  PMTILES_KEY: string;
}

const TILES_PATH = '/tiles/basemap.pmtiles';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === TILES_PATH) return serveArchive(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function serveArchive(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  const range = request.headers.get('Range');
  if (!range) {
    // Not an error the map can hit — the pmtiles reader always sends a range.
    // A bare GET is a browser or a crawler, and answering it would ship the
    // whole archive.
    return new Response('Range header required', { status: 416 });
  }

  // The Cache API keys on the request URL alone, so the range has to be part
  // of the key or every range would collide on the first one cached.
  const cacheKey = new Request(`${request.url}#${range}`, { method: 'GET' });
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  // R2 parses the Range header itself, including the multi-range and suffix
  // forms, so it stays the one thing that interprets it.
  const object = await env.TILES.get(env.PMTILES_KEY, {
    range: request.headers,
    onlyIf: request.headers,
  });

  if (!object) {
    return new Response(
      `No object "${env.PMTILES_KEY}" in the tiles bucket. Upload the .pmtiles archive to R2.`,
      { status: 404 },
    );
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', `public, max-age=${CACHE_SECONDS}`);
  headers.set('content-type', 'application/octet-stream');
  headers.set('accept-ranges', 'bytes');

  // An R2Object with no body is a conditional request that did not match:
  // the client's copy is current.
  if (!('body' in object) || object.body === null) {
    return new Response(null, { status: 304, headers });
  }

  const served = object.range;
  if (!served) {
    // A range R2 could not resolve against the object.
    return new Response('Range not satisfiable', { status: 416 });
  }

  // R2Range is a union — an offset, a length, either on its own, or a suffix
  // ("the last n bytes"). Content-Range needs both ends resolved, so settle
  // them against the object size here.
  const { offset, length } =
    'suffix' in served
      ? { offset: object.size - served.suffix, length: served.suffix }
      : {
          offset: served.offset ?? 0,
          length: served.length ?? object.size - (served.offset ?? 0),
        };

  if (length > MAX_RANGE_BYTES) {
    return new Response('Range too large', { status: 416 });
  }

  headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
  headers.set('content-length', String(length));

  const response = new Response(request.method === 'HEAD' ? null : object.body, {
    status: 206,
    headers,
  });

  if (request.method === 'GET') {
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
}
