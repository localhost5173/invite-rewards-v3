# Dockerfile

FROM node:20

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy TypeScript config, config.json and source code
COPY tsconfig.json ./
COPY config.json ./
COPY src ./src

# Build the TypeScript project
RUN npm run build

# Copy other necessary files (if any)
COPY . .

# Start the app
CMD ["node", "dist/src/index.js"]
