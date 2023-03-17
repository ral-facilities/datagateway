# Multipart build dockerfile to build and serve datagateway

FROM node:16.14-alpine3.15 as build

WORKDIR /datagateway

# Enable dependency caching and share the cache between projects
ENV YARN_ENABLE_GLOBAL_CACHE=true
ENV YARN_GLOBAL_FOLDER=/root/.cache/.yarn

COPY . .

RUN --mount=type=cache,target=/root/.cache/.yarn/cache \
    set -eux; \
    # Set the React production variables which hold reference to the paths of the plugin builds \
    echo "REACT_APP_DATAVIEW_BUILD_DIRECTORY=/datagateway-dataview/" > packages/datagateway-dataview/.env.production; \
    echo "REACT_APP_DOWNLOAD_BUILD_DIRECTORY=/datagateway-download/" > packages/datagateway-download/.env.production; \
    echo "REACT_APP_SEARCH_BUILD_DIRECTORY=/datagateway-search/" > packages/datagateway-search/.env.production; \
    \
    cp packages/datagateway-dataview/public/datagateway-dataview-settings.example.json packages/datagateway-dataview/public/datagateway-dataview-settings.json; \
    cp packages/datagateway-download/public/datagateway-download-settings.example.json packages/datagateway-download/public/datagateway-download-settings.json; \
    cp packages/datagateway-search/public/datagateway-search-settings.example.json packages/datagateway-search/public/datagateway-search-settings.json; \
    \
    yarn workspaces focus --all --production; \
    yarn build;

# Put the output of the build into an apache server
FROM httpd:2.4-alpine3.15
WORKDIR /usr/local/apache2/htdocs
COPY --from=build /datagateway/packages/datagateway-dataview/build/. ./datagateway-dataview/
COPY --from=build /datagateway/packages/datagateway-download/build/. ./datagateway-download/
COPY --from=build /datagateway/packages/datagateway-search/build/. ./datagateway-search/
# example url: http://localhost:8080/datagateway-dataview/main.js

RUN set -eux; \
    # Privileged ports are permitted to root only by default. \
    # setcap to bind to privileged ports (80) as non-root. \
    apk --no-cache add libcap; \
    setcap 'cap_net_bind_service=+ep' /usr/local/apache2/bin/httpd; \
    \
    # Change ownership of logs directory \
    chown www-data:www-data /usr/local/apache2/logs; \
    \
    # Change ownership of setting files \
    chown www-data:www-data /usr/local/apache2/htdocs/datagateway-dataview/datagateway-dataview-settings.json; \
    chown www-data:www-data /usr/local/apache2/htdocs/datagateway-download/datagateway-download-settings.json; \
    chown www-data:www-data /usr/local/apache2/htdocs/datagateway-search/datagateway-search-settings.json;

# Switch to non-root user defined in httpd image
USER www-data

ENV API_URL="/datagateway-api"
ENV DOWNLOAD_API_URL="http://localhost"
ENV ICAT_URL="http://localhost"
ENV IDS_URL="http://localhost"

COPY docker/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["httpd-foreground"]
EXPOSE 80