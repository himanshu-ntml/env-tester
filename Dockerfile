FROM node:18-alpine

RUN apk add --no-cache bash postgresql-client

WORKDIR /app

COPY server.js .
COPY sync.sh .
COPY status.json .

RUN npm init -y && npm install express
RUN chmod +x sync.sh

CMD ["node", "server.js"]
