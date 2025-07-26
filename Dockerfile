# Use official Node.js LTS Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Expose app port
EXPOSE 5000

# Start the app
CMD ["npm", "start"] 