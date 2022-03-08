FROM node:17-alpine AS build
ENV NODE_ENV production
# Add a work directory
WORKDIR /app
# Copy app files
COPY . .
RUN yarn install --production

# Build the app
RUN yarn build
