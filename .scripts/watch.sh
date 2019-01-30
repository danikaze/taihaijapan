#!/usr/bin/env bash

COLOR_TITLE='\033[1;44m'
COLOR_MSG='\033[1;36m'
COLOR_NC='\033[0m'

NODEBIN="./node_modules/.bin"
TSC="$NODEBIN/tsc"
WEBPACK="$NODEBIN/webpack"
WORKBOX="$NODEBIN/workbox"
RIMRAF="$NODEBIN/rimraf"

mkdir -p build

trap "pkill -P $$" EXIT
trap "exit 0" INT TERM ERR

echo -e "${COLOR_TITLE} Building backend code ${COLOR_NC}"

echo -e "${COLOR_MSG} * Building TypeScript files...${COLOR_NC}"
$TSC -w -p tsconfig.backend.json &

echo -e "${COLOR_MSG} * Copying other files...${COLOR_NC}"
cp package.json build
rsync -a --prune-empty-dirs --exclude '*.ts' --exclude 'public' --exclude '.DS_Store' backend build

echo
echo -e "${COLOR_TITLE} Building frontend code: ${COLOR_NC}"
$RIMRAF build/__temp # delete just in case it was left, to avoid errors

echo -e "${COLOR_MSG} * Packing web code...${COLOR_NC}"
$WEBPACK --config .webpack/frontend.dev.js

echo -e "${COLOR_MSG} * Building service workers...${COLOR_NC}"
$WORKBOX injectManifest workbox.config.js
$WEBPACK --config .webpack/sw.dev.js

echo -e "${COLOR_MSG} * Cleaning service workers...${COLOR_NC}"
$RIMRAF build/__temp

wait
