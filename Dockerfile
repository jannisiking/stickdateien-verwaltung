# syntax=docker/dockerfile:1

FROM node:latest
ENV NODE_ENV=development

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm i

COPY . .

CMD [ "npm", "run", "dev"]
