# Dockerfile to build and serve datagateway

# Build stage
FROM node:22.12.0-alpine3.19@sha256:40dc4b415c17b85bea9be05314b4a753f45a4e1716bb31c01182e6c53d51a654 AS builder

WORKDIR /datagateway-build

# Enable dependency caching and share the cache between projects
ENV YARN_ENABLE_GLOBAL_CACHE=true
ENV YARN_GLOBAL_FOLDER=/root/.cache/.yarn

# only copy what's needed to install dependencies first
COPY --parents yarn.lock .yarnrc.yml .yarn **/package.json ./

RUN --mount=type=cache,target=/root/.cache/.yarn/cache \
    set -eux; \
    \
    SKIP_POSTINSTALL=true yarn workspaces focus --all --production;

COPY . .

RUN set -eux; \
    \
    # Set the React production variables which hold reference to the paths of the plugin builds \
    echo "VITE_DATAVIEW_BUILD_DIRECTORY=/datagateway-dataview/" > packages/datagateway-dataview/.env.production; \
    echo "VITE_DOWNLOAD_BUILD_DIRECTORY=/datagateway-download/" > packages/datagateway-download/.env.production; \
    echo "VITE_SEARCH_BUILD_DIRECTORY=/datagateway-search/" > packages/datagateway-search/.env.production; \
    \
    yarn tsc; \
    yarn build;

# Run stage
FROM httpd:2.4.58-alpine3.19@sha256:92535cf7f151901ba91b04186292c3bd5bf82aa6ffa6eb7bc405fefbffedd480

WORKDIR /usr/local/apache2/htdocs

# Put the output of the build into an apache server
COPY --from=builder /datagateway-build/packages/datagateway-dataview/dist/. ./datagateway-dataview/
COPY --from=builder /datagateway-build/packages/datagateway-download/dist/. ./datagateway-download/
COPY --from=builder /datagateway-build/packages/datagateway-search/dist/. ./datagateway-search/

RUN set -eux; \
    \
    # Enable mod_deflate \
    sed -i -e 's/^#LoadModule deflate_module/LoadModule deflate_module/' /usr/local/apache2/conf/httpd.conf; \
    # Compress all files except images \
    echo 'SetOutputFilter DEFLATE' >> /usr/local/apache2/conf/httpd.conf; \
    echo 'SetEnvIfNoCase Request_URI "\.(?:gif|jpe?g|png)$" no-gzip' >> /usr/local/apache2/conf/httpd.conf; \
    # Disable caching for .js, .json, and .html files \
    echo '<FilesMatch ".(js|json|html)$">' >> /usr/local/apache2/conf/httpd.conf; \
    echo '    Header set Cache-Control "no-cache"' >> /usr/local/apache2/conf/httpd.conf; \
    echo '</FilesMatch>' >> /usr/local/apache2/conf/httpd.conf; \
    \
    # Privileged ports are permitted to root only by default. \
    # setcap to bind to privileged ports (80) as non-root. \
    apk --no-cache add libcap; \
    setcap 'cap_net_bind_service=+ep' /usr/local/apache2/bin/httpd; \
    \
    # Change ownership of logs directory \
    chown www-data:www-data /usr/local/apache2/logs; \
    \
    # Change ownership of settings locations \
    chown www-data:www-data -R /usr/local/apache2/htdocs/datagateway-dataview/; \
    chown www-data:www-data -R /usr/local/apache2/htdocs/datagateway-download/; \
    chown www-data:www-data -R /usr/local/apache2/htdocs/datagateway-search/;

# Switch to non-root user defined in httpd image
USER www-data

ENV FACILITY_NAME="LILS"
ENV API_URL="/datagateway-api"
ENV DOWNLOAD_API_URL="http://localhost/topcat"
ENV ICAT_URL="http://localhost/icat"
ENV IDS_URL="http://localhost/ids"
ENV DOI_MINTER_URL="http://localhost/doi-minter"
ENV DATACITE_URL="https://api.test.datacite.org"

COPY docker/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["httpd-foreground"]
EXPOSE 80
