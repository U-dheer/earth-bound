FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3006

# Start in development mode
CMD ["npm", "run", "start:dev"]