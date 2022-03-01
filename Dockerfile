FROM httpd:2.4

ADD https://github.com/ral-facilities/datagateway/releases/download/snapshot/datagateway-dataview-snapshot.tar.gz /tmp/

RUN tar -xvf /tmp/datagateway-dataview-snapshot.tar.gz --strip-components=1 -C /usr/local/apache2/htdocs/

WORKDIR /usr/local/apache2/htdocs/

RUN mkdir -p plugins/datagateway-dataview

COPY config/datagateway-dataview-settings.json /usr/local/apache2/htdocs/plugins/datagateway-dataview/

COPY config/httpd.conf /usr/local/apache2/conf/

RUN mv res plugins/datagateway-dataview

RUN sed -i -e 's,/plugins/datagateway-dataview,http://localhost:8081/plugins/datagateway-dataview,g' /usr/local/apache2/htdocs/main.js  