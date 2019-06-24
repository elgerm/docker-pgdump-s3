FROM node:lts-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
RUN apk update
RUN apk add --no-cache 'postgresql>11.2' 
CMD ["node", "index.js"]
