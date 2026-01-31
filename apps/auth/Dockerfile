FROM node:20-alpine

WORKDIR /app

# Copy package.json from the correct app directory (relative to build context)
COPY apps/auth/package*.json ./

# Install all dependencies including devDependencies
RUN npm install

# Copy only the auth app files
COPY apps/auth/ .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
