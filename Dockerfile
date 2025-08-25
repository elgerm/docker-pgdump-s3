FROM node:20-alpine

WORKDIR /usr/src/app
COPY . .
RUN npm install

# install PostgreSQL (if use pg_dump or psql)
RUN apk add --no-cache postgresql-client

CMD ["node", "index.js"]