#!/bin/bash

read -p "Are you sure you want to deploy? (yes/no): " confirm
if [[ $confirm != "yes" ]]; then
  echo "Deployment aborted."
  exit 1
fi

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Remove the local dist directory
rm -rf ./dist

# Build the project
npm run build

# Copy .env into the dist directory
cp .env ./dist

# Transfer src/languages into dist/src/languages
mkdir -p ./dist/src/languages
cp -r ./src/languages/* ./dist/src/languages/

# Create a temporary directory to remove unnecessary folders
mkdir -p ./temp
cp -r ./ ./temp
rm -rf ./temp/src
rm -rf ./temp/node_modules
rm -rf ./temp/.git
rm -rf ./temp/.vscode

# Set dev=false in the config.json file
if [[ -f "temp/config.json" ]]; then
  jq '.dev = false' temp/config.json > temp/config.tmp && mv temp/config.tmp temp/config.json
else
  echo "config.json not found in temp directory!"
  exit 1
fi

# Copy the build and .env file to the remote server
scp -r ./temp/* root@$VPS_IP:/home/invite-rewards-prod
scp .env root@$VPS_IP:/home/invite-rewards-prod/.env
rm -rf ./temp

# Install dependencies and reload the application on the remote server
ssh -t root@$VPS_IP << 'EOF'
# pm2 stop 0
cd /home/invite-rewards-prod
npm i
cd dist
pm2 start /home/invite-rewards-prod/dist/src/index.js --log ../logs.txt
pm2 save
EOF

echo "Deployment completed with zero downtime."
