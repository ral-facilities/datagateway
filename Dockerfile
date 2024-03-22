# Dockerfile to build and serve datagateway

# Build stage
FROM node:20.11.1-alpine3.19@sha256:bf77dc26e48ea95fca9d1aceb5acfa69d2e546b765ec2abfb502975f1a2d4def as builder

WORKDIR /datagateway-build

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

# Run stage
FROM httpd:2.4.53-alpine3.15@sha256:4eb4177b9245c686696dd8120c79cd64b7632b27d890db4cad3b0e844ed737af

WORKDIR /usr/local/apache2/htdocs

# Put the output of the build into an apache server
COPY --from=builder /datagateway-build/packages/datagateway-dataview/build/. ./datagateway-dataview/
COPY --from=builder /datagateway-build/packages/datagateway-download/build/. ./datagateway-download/
COPY --from=builder /datagateway-build/packages/datagateway-search/build/. ./datagateway-search/

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
    # Change ownership of setting files \
    chown www-data:www-data /usr/local/apache2/htdocs/datagateway-dataview/datagateway-dataview-settings.json; \
    chown www-data:www-data /usr/local/apache2/htdocs/datagateway-download/datagateway-download-settings.json; \
    chown www-data:www-data /usr/local/apache2/htdocs/datagateway-search/datagateway-search-settings.json;

# Switch to non-root user defined in httpd image
USER www-data

ENV FACILITY_NAME="LILS"
ENV API_URL="/datagateway-api"
ENV DOWNLOAD_API_URL="http://localhost/topcat"
ENV ICAT_URL="http://localhost/icat"
ENV IDS_URL="http://localhost/ids"

COPY docker/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["httpd-foreground"]
EXPOSE 80
