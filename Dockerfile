FROM node:10.10

WORKDIR /home/app

RUN apt-get update && apt-get install zsh -y

COPY package.json package.json

COPY yarn.lock yarn.lock

RUN npm i -g yarn

RUN yarn
