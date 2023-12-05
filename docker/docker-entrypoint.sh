#!/bin/sh -eu

# Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
TEMPFILE="$(mktemp)"

# Set values in datagateway-dataview-settings.json from environment variables
sed -e "s|\"idsUrl\": \".*\"|\"idsUrl\": \"$IDS_URL\"|" \
    -e "s|\"apiUrl\": \".*\"|\"apiUrl\": \"$API_URL\"|" \
    -e "s|\"downloadApiUrl\": \".*\"|\"downloadApiUrl\": \"$DOWNLOAD_API_URL\"|" \
    /usr/local/apache2/htdocs/datagateway-dataview/datagateway-dataview-settings.json > "$TEMPFILE"

cat "$TEMPFILE" > /usr/local/apache2/htdocs/datagateway-dataview/datagateway-dataview-settings.json

# Set values in datagateway-download-settings.json from environment variables
sed -e "s|\"idsUrl\": \".*\"|\"idsUrl\": \"$IDS_URL\"|" \
    -e "s|\"apiUrl\": \".*\"|\"apiUrl\": \"$API_URL\"|" \
    -e "s|\"downloadApiUrl\": \".*\"|\"downloadApiUrl\": \"$DOWNLOAD_API_URL\"|" \
    /usr/local/apache2/htdocs/datagateway-download/datagateway-download-settings.json > "$TEMPFILE"

cat "$TEMPFILE" > /usr/local/apache2/htdocs/datagateway-download/datagateway-download-settings.json

# Set values in datagateway-search-settings.json from environment variables
sed -e "s|\"idsUrl\": \".*\"|\"idsUrl\": \"$IDS_URL\"|" \
    -e "s|\"apiUrl\": \".*\"|\"apiUrl\": \"$API_URL\"|" \
    -e "s|\"downloadApiUrl\": \".*\"|\"downloadApiUrl\": \"$DOWNLOAD_API_URL\"|" \
    -e "s|\"icatUrl\": \".*\"|\"icatUrl\": \"$ICAT_URL\"|" \
    /usr/local/apache2/htdocs/datagateway-search/datagateway-search-settings.json > "$TEMPFILE"

cat "$TEMPFILE" > /usr/local/apache2/htdocs/datagateway-search/datagateway-search-settings.json

rm "$TEMPFILE"

# Run the CMD instruction
exec "$@"
