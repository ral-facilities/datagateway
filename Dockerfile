# Multipart build dockerfile to build and serve datagateway

FROM node:16.14-alpine3.15 as build
WORKDIR /datagateway
ENV PATH /datagateway/node_modules/.bin:$PATH

# TODO: use yarn install --production:
# https://github.com/ral-facilities/datagateway/issues/1155

# Set Yarn version
# TODO - Use Yarn 2 when project is upgraded
RUN yarn set version 1.22

# Install dependancies
COPY . .
RUN yarn install
RUN yarn build

# Put the output of the build into an apache server
FROM httpd:2.4-alpine3.15
WORKDIR /usr/local/apache2/htdocs
COPY --from=build /datagateway/packages/datagateway-dataview/build/. ./datagateway-dataview/
COPY --from=build /datagateway/packages/datagateway-download/build/. ./datagateway-download/
COPY --from=build /datagateway/packages/datagateway-search/build/. ./datagateway-search/
# example url: http://localhost:8080/datagateway-dataview/main.js

# Define virtual hosts so that the plugins can be deployed on different ports
# TODO - Make virtual hosts production ready
#        They need to be configured differently especially if using https:
#        https://github.com/ral-facilities/scigateway/wiki/Deploying-Datagateway
WORKDIR /usr/local/apache2/conf
RUN sed -i '/Listen 80$/a\
\Listen 5001\n\
\Listen 5002\n\
\Listen 5003\n\
\n\
\<VirtualHost *:5001>\n\
\    DocumentRoot "/usr/local/apache2/htdocs/datagateway-dataview"\n\
\</VirtualHost>\n\
\n\
\<VirtualHost *:5002>\n\
\    DocumentRoot "/usr/local/apache2/htdocs/datagateway-download"\n\
\</VirtualHost>\n\
\n\
\<VirtualHost *:5003>\n\
\    DocumentRoot "/usr/local/apache2/htdocs/datagateway-search"\n\
\</VirtualHost>' httpd.conf


