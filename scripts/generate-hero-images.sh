#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SOURCE="$ROOT/design/references/a_wide_cinematic_landscape_scene_a_dramatic_moun.png"
OUTPUT="$ROOT/public/images"

generate() {
  name=$1
  format=$2
  width=$3
  framing=$4
  quality=$5
  destination="$OUTPUT/$name-$width.$format"

  set -- "$SOURCE"
  if [ "$framing" = mobile ]; then
    set -- "$@" -crop 530x812+1350+0 +repage
  fi

  set -- "$@" -resize "${width}x" -strip
  if [ "$format" = webp ]; then
    set -- "$@" -define webp:method=6
  else
    set -- "$@" -define heic:speed=6
  fi
  magick "$@" -quality "$quality" "$destination"
}

for format in webp avif; do
  if [ "$format" = webp ]; then
    quality=78
  else
    quality=52
  fi
  for width in 960 1938; do
    generate hero-mountains-desktop "$format" "$width" desktop "$quality"
  done
  for width in 390 530; do
    generate hero-mountains-mobile "$format" "$width" mobile "$quality"
  done
done

printf '%s\n' 'Generated responsive AVIF and WebP Hero images from the approved source.'
