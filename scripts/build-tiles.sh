#!/usr/bin/env bash
#
# Cuts the basemap archive: a regional extract of the Protomaps daily planet
# build, written to ./tiles/basemap.pmtiles.
#
# The extract is pulled straight out of the remote planet archive over range
# requests, so only the region's bytes are downloaded — there is no 100 GB
# intermediate file. Nothing here is committed; the archive is data, and
# ./tiles is gitignored.
#
# Usage:
#   ./scripts/build-tiles.sh                 # default region and zoom
#   BBOX=110,-9,116,-7 ./scripts/build-tiles.sh
#   MAXZOOM=13 ./scripts/build-tiles.sh      # smaller file, less detail
#
# Requires the pmtiles CLI:
#   brew install pmtiles
#   or a release binary from https://github.com/protomaps/go-pmtiles/releases

set -euo pipefail

# Indonesian search and rescue region, with sea room either side: the SRR
# reaches well past the coastline and a datum can drift out of a tight box.
# West of Sumatra to east of Papua, Timor Sea to north of Sulawesi.
BBOX="${BBOX:-92.0,-14.0,142.0,8.0}"

# z15 is where the Protomaps planet build stops carrying data; the renderer
# overzooms past it. Dropping to 13 or 14 cuts the file substantially and
# still reads fine at search-planning scale, where the useful detail is
# coastline and navigation rather than building footprints.
MAXZOOM="${MAXZOOM:-15}"

OUT="${OUT:-tiles/basemap.pmtiles}"

command -v pmtiles >/dev/null 2>&1 || {
  echo "pmtiles CLI not found." >&2
  echo "  brew install pmtiles" >&2
  echo "  or https://github.com/protomaps/go-pmtiles/releases" >&2
  exit 1
}

# Protomaps keeps roughly a week of daily planet builds and there is no
# "latest" alias, so walk back from today until one answers.
find_build() {
  for i in $(seq 0 10); do
    local day
    if date -v-1d >/dev/null 2>&1; then
      day=$(date -u -v-"${i}"d +%Y%m%d)   # BSD date (macOS)
    else
      day=$(date -u -d "-${i} days" +%Y%m%d)  # GNU date
    fi
    local url="https://build.protomaps.com/${day}.pmtiles"
    if curl -sf -o /dev/null -r 0-1 "$url"; then
      echo "$url"
      return 0
    fi
  done
  return 1
}

echo "Finding the most recent Protomaps planet build..."
BUILD=$(find_build) || {
  echo "No build found in the last 10 days. Check https://maps.protomaps.com/builds/" >&2
  exit 1
}

echo "Build:   $BUILD"
echo "Region:  $BBOX"
echo "Maxzoom: $MAXZOOM"
echo "Output:  $OUT"
echo

mkdir -p "$(dirname "$OUT")"
pmtiles extract "$BUILD" "$OUT" --bbox="$BBOX" --maxzoom="$MAXZOOM"

echo
echo "Done: $(du -h "$OUT" | cut -f1)  $OUT"
echo
echo "Next: upload it to R2 with"
echo "  ./scripts/upload-tiles.sh"
