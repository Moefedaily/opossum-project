# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files FIRST
COPY package*.json ./

# Install dependencies in the Linux container (this fixes esbuild platform issue)
RUN npm ci

# Copy source code AFTER dependencies are installed
COPY . .

# Build Angular app for production
RUN npm run build --configuration=production

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built Angular app
COPY --from=build /app/dist/admin-web/browser .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]