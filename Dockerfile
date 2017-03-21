FROM node:7.7

RUN apt-get update && apt-get install -y curl apt-transport-https && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn

EXPOSE 8080

RUN mkdir -p /usr/app/src
WORKDIR /usr/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
ENV PROJECT_ID=battle-planner

COPY package.json yarn.lock /usr/app/
RUN yarn install --prod
COPY ./src/ /usr/app/src/

CMD [ "yarn", "start" ]
