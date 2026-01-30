FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy all workspace package.json files for proper dependency resolution
COPY apps/api/package.json ./apps/api/
COPY apps/auth/package.json ./apps/auth/
COPY apps/gateway/package.json ./apps/gateway/
COPY packages ./packages

# Install dependencies (including devDependencies for development)
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy rest of the application
COPY apps/api ./apps/api

# Expose the port
EXPOSE 3000

# Start in development mode using pnpm filter from root
WORKDIR /app
CMD ["pnpm", "--filter", "api", "run", "start:dev"]