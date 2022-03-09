# Multipart build dockerfile to build and serve datagateway

# build datagateway
FROM node:16-alpine as build
WORKDIR /datagateway
ENV PATH /datagateway/node_modules/.bin:$PATH

# TODO: use yarn install --production
# install dependancies
COPY . .
RUN yarn install
RUN yarn build

# put the output of the build into an apache server
FROM httpd:alpine
WORKDIR /var/www/html
COPY --from=build /datagateway/packages/ .