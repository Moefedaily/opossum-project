FROM node:18-alpine
WORKDIR /app

# Install Expo CLI globally (as root - fine for development container)
RUN npm install -g @expo/cli

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose Expo development server port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8081/ || exit 1

# Default command for development
CMD ["npx", "expo", "start", "--host", "0.0.0.0"]