# Simple development Dockerfile
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=development

# Copy source files
COPY . .

# Expose port
EXPOSE 3000
EXPOSE 9229

# Start command
CMD ["npm", "run", "start:dev"]
