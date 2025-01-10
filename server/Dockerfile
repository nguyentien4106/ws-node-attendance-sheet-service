# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to install dependencies
COPY package*.json ./

# Install dependencies (include devDependencies for the build process)
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Run the build command to bundle the application into the dist folder
RUN npm run build

# Remove unnecessary files (optional) after build
RUN npm prune --production

# Expose the ports your app uses (change as needed)
EXPOSE 3002
EXPOSE 8081

# Set the default command to run the bundled application
CMD ["node", "dist/index.js"]
