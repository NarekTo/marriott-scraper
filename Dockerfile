FROM ghcr.io/puppeteer/puppeteer:18.2.1
ARG NPM_TOKEN
ENTRYPOINT ["bash", "/app/entrypoint.sh"]

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR /app

COPY . /app
RUN set -ex \
    && mv .npmrc.docker .npmrc \
    && npm set unsafe-perm true \
    && npm ci \
    && npm cache verify \
    && rm -rf ~/.npmrc ~/.ssh 
# RUN npm install puppeteer --unsafe-perm=true --allow-root
