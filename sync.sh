#!/bin/sh
# Pull the landing back from the Bug Lab working tree, where it is edited.
# ponytail: a copy, not a submodule — the game repo is on Bitbucket and this one is not.
set -e
SRC="/Users/malakhov/code/wowcube-madchem/wowcube/site"
DST="$(cd "$(dirname "$0")" && pwd)/site"
rsync -a --delete --exclude 'assets/generated' "$SRC/" "$DST/"
echo "synced from $SRC — review with 'git diff', then commit and push to deploy"
