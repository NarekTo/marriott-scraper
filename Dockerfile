FROM ghcr.io/puppeteer/puppeteer:19.11.1
FROM node:16

WORKDIR /app
ENTRYPOINT ["bash", "entrypoint.sh"]
CMD ["npm", "start"]

ARG BOT_SSH_KEY
ARG NPM_RC
ARG NPM_TOKEN

ENV ENVCONSUL_VERSION=0.7.3

ADD https://releases.hashicorp.com/envconsul/${ENVCONSUL_VERSION}/envconsul_${ENVCONSUL_VERSION}_linux_amd64.tgz /tmp/consul/envconsul.tgz
RUN set -ex \
  && cd /tmp/consul \
  && if [ -d envconsul.tgz ]; then \
    cp envconsul.tgz/envconsul /usr/bin/envconsul; \
  else \
    tar -xzf envconsul.tgz -C /usr/bin/; \
  fi \
  && rm -rf /tmp/consul \
  && chmod +x /usr/bin/envconsul

COPY package.json package-lock.json .npmrc.docker entrypoint.sh /app/
RUN set -ex \
  && echo $NPM_RC | base64 -d > ~/.npmrc \
  && mv entrypoint.sh / \
  && mkdir ~/.ssh \
  && echo $BOT_SSH_KEY | base64 -d > ~/.ssh/id_rsa \
  && chmod 0600 ~/.ssh/id_rsa \
  && ssh-keyscan -H bitbucket.org > ~/.ssh/known_hosts \
  && npm set unsafe-perm true \
  && npm i \
  && npm cache verify \
  && rm -rf ~/.npmrc ~/.ssh

COPY . /app
RUN set -ex \
  && npm cache clean --force \
  && ls -l
