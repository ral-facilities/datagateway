# Multipart build dockerfile to build and serve datagateway

FROM node:16-alpine as build
WORKDIR /datagateway
ENV PATH /datagateway/node_modules/.bin:$PATH

# TODO: use yarn install --production:
# https://github.com/ral-facilities/datagateway/issues/1155

# Install dependancies
COPY . .
RUN yarn install
RUN yarn build

# Put the output of the build into an apache server
FROM httpd:alpine
WORKDIR /usr/local/apache2/htdocs
COPY --from=build /datagateway/packages/ .
# example url: http://localhost:8080/datagateway-dataview/build/main.js