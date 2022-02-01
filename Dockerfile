#zuerst wird ein temporärer Dockercontainer deps erstellt
#in diesen werden alle dependencies erstellt (node modules) mit npm install
FROM node:14-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build

EXPOSE 3050


CMD ["npm", "run", "start"]