FROM node:18-alpine as build

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build client
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built client and server
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server ./server
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]