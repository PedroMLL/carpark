FROM node:9-alpine
RUN apk  --no-cache add bash openssl
ADD . /src
WORKDIR /src

VOLUME [ "/src/keys" ]

RUN apk add --no-cache --virtual .gyp \
    python \
    make \
    g++ \
    && npm install \
    && apk del .gyp

ENTRYPOINT [ "/src/docker.sh" ]