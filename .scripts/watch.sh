#!/usr/bin/env bash

COLOR_MESSAGE='\033[0;36m'
COLOR_IMPORTANT='\033[1;31m'
COLOR_NC='\033[0m'

NODEBIN="./node_modules/.bin"
WEBPACK="$NODEBIN/webpack"
SERVER_SETTINGS="dev.json"

mkdir -p build

trap "pkill -P $$" EXIT
trap "exit 0" INT TERM ERR

echo -e "${COLOR_MESSAGE}Building backend code:${COLOR_NC}"

echo -e " * Building TypeScript files..."
$TSC -p tsconfig.backend.json

echo -e " * Copying other files..."
cp package.json build
rsync -a --prune-empty-dirs --exclude '*.ts' --exclude 'public' --exclude '.DS_Store' backend build

echo
echo -e "${COLOR_MESSAGE}Building frontend code:${COLOR_NC}"
$WEBPACK --config webpack.dev.config.js

echo -e " * Copying other files..."
rsync -a --prune-empty-dirs --exclude '.DS_Store' frontend/public/ build/backend/public
wait
