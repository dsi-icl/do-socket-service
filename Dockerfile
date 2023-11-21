FROM node:hydrogen-alpine
LABEL maintainer="Brython Caley-Davies <bc2918@ic.ac.uk>"

RUN apk add --update && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --silent

COPY dist/app.js ./
COPY public/ ./public/
COPY node_modules/socket.io-client/dist/socket.io.js ./

EXPOSE 8080

CMD ["npm", "run", "start"]
