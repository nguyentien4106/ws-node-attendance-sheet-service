# Dockerfile in ./client directory

# Step 1: Build the Vite app
FROM node:18 AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . ./

# Run the build process (Vite will output to /dist)
RUN npm run build

# Check if the dist folder exists
RUN ls /app/dist

# Step 2: Serve the built app with Nginx
FROM nginx:alpine

# Copy the built app from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 5000
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
