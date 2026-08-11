# Stage 1: Build the Vue/React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Environment variables like VITE_API_URL must be passed as build args
ARG VITE_API_URL=/api/v1
ARG VITE_WS_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Default backend URL for standalone deployment fallback
ENV BACKEND_URL=http://backend:8000

# Copy the custom Nginx configuration as a template so env variables can be substituted
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
