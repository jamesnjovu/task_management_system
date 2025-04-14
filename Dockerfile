# Use the official Node.js 20.18 image as the base image
FROM node:20.18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy server files
COPY server/ ./

# Create uploads directory
RUN mkdir -p uploads

# Create logs directory
RUN mkdir -p logs

# Expose the API port
EXPOSE 5000

# Set environment variable to production
ENV NODE_ENV=production

# Command to run the server
CMD ["npm", "start"]
