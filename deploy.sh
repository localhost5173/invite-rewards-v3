read -p "Are you sure you want to deploy? (yes/no): " confirm
if [[ $confirm != "yes" ]]; then
  echo "Deployment aborted."
  exit 1
fi

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Remove the local dist directory
sudo rm -rf ./dist

# Build the project
npm run build

# Copy .env into the dist directory
cp .env ./dist

# Create a temporary directory to remove unnecessary folders
mkdir -p ./temp
rsync -av --exclude 'node_modules' --exclude '.git' ./ ./temp

# Set dev to false in config.json
jq '.dev = false' ./temp/config.json > ./temp/config.tmp.json && mv ./temp/config.tmp.json ./temp/config.json

# Copy the build to the remote server
scp -r ./temp/* root@$VPS_IP:/home/invite-rewards-prod
rm -rf ./temp

# Install dependencies and reload the application on the remote server
ssh -t root@$VPS_IP << 'EOF'

cd /home/invite-rewards-prod
npm i
cd dist
pm2 reload src/index.js --log ../logs.txt
pm2 save
EOF

echo "Deployment completed with zero downtime."