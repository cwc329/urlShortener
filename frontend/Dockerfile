# Stage 1: Build Stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy only necessary files for dependency installation
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy the rest of the source code
COPY . ./

# Build the React app
RUN NODE_ENV=production yarn build

# Stage 2: Runtime Stage
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx files
RUN rm -rf ./*

# Copy the built React app from the previous stage
COPY --from=build /app/build .
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx HTML files in the same layer as the runtime setup
# RUN rm -rf /usr/share/nginx/html/* && mv /app/build /usr/share/nginx/html

# Expose the port nginx serves on
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
