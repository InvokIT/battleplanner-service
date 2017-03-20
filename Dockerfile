FROM node:6.10

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install yarn

EXPOSE 8080

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
ENV PROJECT_ID=battle-planner

COPY package.json yarn.lock /usr/src/app/
RUN yarn
COPY . /usr/src/app

CMD [ "yarn", "start" ]