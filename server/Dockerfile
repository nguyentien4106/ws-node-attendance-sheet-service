# Dockerfile in ./server directory
FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the application code
COPY . ./

# Expose port (make sure this matches your WebSocket port)
EXPOSE 3002

# Run the server
CMD ["npm", "start"]
