#!/bin/sh -eu

# datagateway-dataview

if [ ! -e /usr/local/apache2/htdocs/datagateway-dataview/datagateway-dataview-settings.json ]; then
    # file doesn't exist, so go with default settings file with env variable substitution
    # if file exists, we skip this code as that means we've been supplied one from a mount

    # Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
    TEMPFILE="$(mktemp)"

    # Set values in datagateway-dataview-settings.example.json from environment variables
    sed -e "s|\"facilityName\": \".*\"|\"facilityName\": \"$FACILITY_NAME\"|" \
        -e "s|\"idsUrl\": \".*\"|\"idsUrl\": \"$IDS_URL\"|" \
        -e "s|\"apiUrl\": \".*\"|\"apiUrl\": \"$API_URL\"|" \
        -e "s|\"downloadApiUrl\": \".*\"|\"downloadApiUrl\": \"$DOWNLOAD_API_URL\"|" \
        -e "s|\"doiMinterUrl\": .*,|\"doiMinterUrl\": \"$DOI_MINTER_URL\",|" \
        -e "s|\"dataCiteUrl\": .*,|\"dataCiteUrl\": \"$DATACITE_URL\",|" \
        -e "s|\"pluginHost\": \".*\"|\"pluginHost\": \"/datagateway-dataview\"|" \
        /usr/local/apache2/htdocs/datagateway-dataview/datagateway-dataview-settings.example.json > "$TEMPFILE"

    cat "$TEMPFILE" > /usr/local/apache2/htdocs/datagateway-dataview/datagateway-dataview-settings.json

    rm "$TEMPFILE"
fi

# datagateway-download

if [ ! -e /usr/local/apache2/htdocs/datagateway-download/datagateway-download-settings.json ]; then
    # file doesn't exist, so go with default settings file with env variable substitution
    # if file exists, we skip this code as that means we've been supplied one from a mount

    # Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
    TEMPFILE="$(mktemp)"

    # Set values in datagateway-download-settings.example.json from environment variables
    sed -e "s|\"facilityName\": \".*\"|\"facilityName\": \"$FACILITY_NAME\"|" \
        -e "s|\"idsUrl\": \".*\"|\"idsUrl\": \"$IDS_URL\"|" \
        -e "s|\"apiUrl\": \".*\"|\"apiUrl\": \"$API_URL\"|" \
        -e "s|\"downloadApiUrl\": \".*\"|\"downloadApiUrl\": \"$DOWNLOAD_API_URL\"|" \
        -e "s|\"doiMinterUrl\": .*,|\"doiMinterUrl\": \"$DOI_MINTER_URL\",|" \
        -e "s|\"dataCiteUrl\": .*,|\"dataCiteUrl\": \"$DATACITE_URL\",|" \
        -e "s|\"pluginHost\": \".*\"|\"pluginHost\": \"/datagateway-download\"|" \
        /usr/local/apache2/htdocs/datagateway-download/datagateway-download-settings.example.json > "$TEMPFILE"

    cat "$TEMPFILE" > /usr/local/apache2/htdocs/datagateway-download/datagateway-download-settings.json

    rm "$TEMPFILE"
fi

# datagateway-search

if [ ! -e /usr/local/apache2/htdocs/datagateway-search/datagateway-search-settings.json ]; then
    # file doesn't exist, so go with default settings file with env variable substitution
    # if file exists, we skip this code as that means we've been supplied one from a mount

    # Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
    TEMPFILE="$(mktemp)"

    # Set values in datagateway-search-settings.example.json from environment variables
    sed -e "s|\"facilityName\": \".*\"|\"facilityName\": \"$FACILITY_NAME\"|" \
        -e "s|\"idsUrl\": \".*\"|\"idsUrl\": \"$IDS_URL\"|" \
        -e "s|\"apiUrl\": \".*\"|\"apiUrl\": \"$API_URL\"|" \
        -e "s|\"downloadApiUrl\": \".*\"|\"downloadApiUrl\": \"$DOWNLOAD_API_URL\"|" \
        -e "s|\"icatUrl\": \".*\"|\"icatUrl\": \"$ICAT_URL\"|" \
        -e "s|\"pluginHost\": \".*\"|\"pluginHost\": \"/datagateway-search\"|" \
        /usr/local/apache2/htdocs/datagateway-search/datagateway-search-settings.example.json > "$TEMPFILE"

    cat "$TEMPFILE" > /usr/local/apache2/htdocs/datagateway-search/datagateway-search-settings.json

    rm "$TEMPFILE"
fi

# Run the CMD instruction
exec "$@"
