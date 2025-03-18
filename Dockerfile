# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present) for caching dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your project files into the container
COPY . .

# Make run.sh executable
RUN chmod +x run.sh

# Expose port if your application listens on one (example: 3000)
EXPOSE 3000

# Run the script to build, copy files, and start the watch process
CMD ["./run.sh"]