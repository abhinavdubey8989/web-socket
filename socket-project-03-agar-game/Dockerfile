

FROM node:18.16.0-alpine3.17
RUN mkdir -p /app

# set workdir , all files will be copied here
WORKDIR /app


# copy everythign except .dockerignore
COPY . .

# generate node_modules
RUN npm ci


# generate dist/
RUN npm run build

# remove src
RUN rm -rf src

# start the server
CMD ["npm", "run" , "start:prod"]
