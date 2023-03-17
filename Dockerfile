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

RUN apk --no-cache add libcap \
  # Privileged ports are permitted to root only by default.
  # setcap to bind to privileged ports (80) as non-root.
  && setcap 'cap_net_bind_service=+ep' /usr/local/apache2/bin/httpd \
  # Change access righs for logs from root to www-data
  && chown www-data:www-data /usr/local/apache2/logs

# Switch to non-root user defined in httpd image
USER www-data
