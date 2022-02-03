#Dateien aus meinem Repo kopieren und bilden
FROM node:14-alpine as builder
COPY . .
RUN npm i
RUN npm run build
EXPOSE 3000
CMD ["npm","run","start"]