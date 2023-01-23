FROM node:18.2.0
ARG NPM_TOKEN
ENTRYPOINT ["bash", "/entrypoint.sh"]

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR /app
RUN apt update && apt install -y libnss3 libatk1.0-0 libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev libasound2

ARG NPM_RC
ARG NPM_TOKEN
COPY . /app
RUN set -ex \
  && echo $NPM_RC | base64 -d > ~/.npmrc \
  && mv entrypoint.sh / \
  && npm set unsafe-perm true \
  && npm i \
  && npm cache verify \
  && rm -rf ~/.npmrc ~/.ssh 
# RUN npm install -g npm@9.3.1
# RUN npm install -g chrome-aws-lambda
RUN npm install -g puppeteer aws-sdk stream zlib csv-write-stream moment assert

