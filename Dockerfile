FROM node:7.7

RUN mkdir -p /usr/app/src
WORKDIR /usr/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
ENV PROJECT_ID=battle-planner

COPY package.json package-lock.json /usr/app/
RUN npm install --production
COPY ./src/ /usr/app/src/

EXPOSE 8080

CMD [ "npm", "start" ]
