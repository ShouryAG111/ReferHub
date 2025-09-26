# Stage 1: Build React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build React app (with API URL if provided)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build


# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built React app to nginx default folder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 (required for Azure App Service)
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
