FROM node:20-alpine

WORKDIR /app

# Copy package.json from the correct app directory (relative to build context)
COPY apps/gateway/package*.json ./

# Install all dependencies including devDependencies
RUN npm install

# Copy only the gateway app files
COPY apps/gateway/ .

EXPOSE 3006

CMD ["npm", "run", "start:dev"]
