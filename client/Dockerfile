# Dockerfile in ./client directory

# Step 1: Build the Vite app
FROM node:18 AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the build process (Vite will output to /dist)
RUN npm run build

# Step 2: Use Node.js to serve the built app
FROM node:18

WORKDIR /app

# Install 'serve' to serve static files
RUN npm install -g serve

# Copy the built app from the previous stage
COPY --from=build /app/dist ./dist

# Expose the port (can be any port you want to use, for example 3000)
EXPOSE 3001

# Use 'serve' to serve the build
CMD ["serve", "-s", "dist", "-l", "3001"]
