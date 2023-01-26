# FROM ghcr.io/puppeteer/puppeteer:18.2.1
FROM node:lts-alpine
RUN apk add --update --no-cache  --virtual build-dependencie \
    chromium \
    mesa \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    bash \
    ttf-freefont \
    desktop-file-utils \
        adwaita-icon-theme \
        ttf-dejavu \
        ffmpeg-libs \
        xdotool \
        build-base 

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ARG NPM_TOKEN
ENTRYPOINT ["bash", "/app/entrypoint.sh"]

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR /app

COPY . /app
RUN set -ex \
    && mv .npmrc.docker .npmrc \
    && npm ci \
    && npm cache verify \
    && rm -rf ~/.npmrc ~/.ssh \