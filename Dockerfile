# � NestJS Development Container - Node.js 24
# Optimized for hot reload and development workflow
FROM node:24-alpine

# Install development tools
RUN apk add --no-cache \
    dumb-init \
    git \
    bash \
    curl

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./

# 🔧 Development environment setup
ENV HUSKY=0 \
    NODE_ENV=development \
    NODE_OPTIONS="--max-old-space-size=1024 --inspect=0.0.0.0:9229" \
    NPM_CONFIG_LOGLEVEL=info

# Install all dependencies (including dev dependencies)
# Using npm install for development to avoid lock file sync issues
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# 🚀 Development ports
EXPOSE 3000 9229

# 🔄 Development startup with hot reload
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:dev"]
