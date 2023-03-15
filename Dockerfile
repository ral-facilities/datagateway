# Multipart build dockerfile to build and serve datagateway

FROM node:16.14-alpine3.15 as build

WORKDIR /datagateway

# Enable dependency caching and share the cache between projects
ENV YARN_ENABLE_GLOBAL_CACHE=true
ENV YARN_GLOBAL_FOLDER=/root/.cache/.yarn

COPY . .

RUN --mount=type=cache,target=/root/.cache/.yarn/cache \
  && echo "REACT_APP_DATAVIEW_BUILD_DIRECTORY=/datagateway-dataview/" > packages/datagateway-dataview/.env.production \
  && echo "REACT_APP_DOWNLOAD_BUILD_DIRECTORY=/datagateway-download/" > packages/datagateway-download/.env.production \
  && echo "REACT_APP_SEARCH_BUILD_DIRECTORY=/datagateway-search/" > packages/datagateway-search/.env.production \
  && yarn workspaces focus --all --production \
  && yarn build

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

RUN apk --no-cache add libcap \
  # Privileged ports are permitted to root only by default.
  # setcap to bind to privileged ports (80) as non-root.
  && setcap 'cap_net_bind_service=+ep' /usr/local/apache2/bin/httpd \
  # Change access righs for logs from root to www-data
  && chown www-data:www-data /usr/local/apache2/logs

# Switch to non-root user defined in httpd image
USER www-data
