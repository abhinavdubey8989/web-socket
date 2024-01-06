FROM node:18.16.0-alpine3.17
RUN mkdir -p /app
WORKDIR /app
COPY package.json  .
COPY package-lock.json  .
COPY tsconfig.json  .

RUN npm ci

COPY . .
RUN npm run build
COPY dist/  .
RUN rm -rf src
CMD [ "npm", "run" , "start:prod"]÷
