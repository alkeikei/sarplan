#!/usr/bin/env bash
#
# Uploads ./tiles/basemap.pmtiles to the R2 bucket the Worker reads.
#
# The bucket name and object key are the ones wrangler.jsonc binds, so if you
# change them there, change them here.

set -euo pipefail

BUCKET="${BUCKET:-navsar-tiles}"
KEY="${KEY:-basemap.pmtiles}"
FILE="${FILE:-tiles/basemap.pmtiles}"

[ -f "$FILE" ] || { echo "No $FILE. Run ./scripts/build-tiles.sh first." >&2; exit 1; }

SIZE_MB=$(( $(wc -c < "$FILE") / 1024 / 1024 ))
echo "$FILE is ${SIZE_MB} MB -> r2://${BUCKET}/${KEY}"

# wrangler's single-shot put is fine up to a few hundred MB. Past that it is
# slow and fragile over a domestic connection, and rclone against R2's S3
# endpoint does a resumable multipart upload instead.
if [ "$SIZE_MB" -gt 300 ]; then
  cat >&2 <<'EOF'

That is past the size wrangler uploads comfortably in one request. Use rclone:

  1. Create an R2 API token (Cloudflare dashboard -> R2 -> Manage API tokens)
  2. Configure a remote of type "s3", provider "Cloudflare", with endpoint
     https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  3. rclone copyto tiles/basemap.pmtiles r2:navsar-tiles/basemap.pmtiles --progress

Or re-cut a smaller archive:  MAXZOOM=13 ./scripts/build-tiles.sh

EOF
  exit 1
fi

npx wrangler r2 object put "${BUCKET}/${KEY}" --file="$FILE" --remote
echo "Uploaded. Deploy with: npm run deploy"
