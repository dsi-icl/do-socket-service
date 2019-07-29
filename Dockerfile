FROM node:carbon-alpine
MAINTAINER James Scott-Brown <j.scott-brown@imperial.ac.uk>

RUN apk add --update \
    supervisor \
  && rm -rf /var/cache/apk/*

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY app /app

RUN /bin/mkdir -p /app/logs

WORKDIR /app

RUN npm install --silent
RUN npm dedupe

EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

