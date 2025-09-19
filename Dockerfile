# 🐳 Optimized Docker Image for Memory Efficiency
# Based on Node.js 24 Alpine for minimal footprint
FROM node:24-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security and better memory management
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
# Use regular package.json
COPY --chown=nestjs:nodejs package*.json ./

# 📦 Install dependencies (dev included for flexibility) 
# Disable Husky hooks in Docker environment
ENV HUSKY=0
RUN npm install --no-audit --no-fund && \
    npm cache clean --force

# Copy source files
COPY --chown=nestjs:nodejs . .

# Remove unnecessary files to save memory
RUN rm -rf .git .github docs scripts *.md && \
    find . -name "*.spec.ts" -delete && \
    find . -name "*.test.ts" -delete

# Build the application pour production, mais préparer pour dev
RUN npx nest build

# Ensure proper ownership for critical directories only (faster than full /app)
# This allows the nestjs user to write to dist/ during hot reload
RUN chown -R nestjs:nodejs /app/dist /app/src

# Switch to non-root user
USER nestjs

# Set Node.js memory limits and optimizations
ENV NODE_ENV=development \
    NODE_OPTIONS="--max-old-space-size=512 --inspect=0.0.0.0:9229" \
    NPM_CONFIG_LOGLEVEL=warn

# Expose ports
EXPOSE 3000
EXPOSE 9229

# Use dumb-init for proper signal handling and memory management
ENTRYPOINT ["dumb-init", "--"]

# Start command avec hot reload pour développement
CMD ["npm", "run", "start:dev"]
