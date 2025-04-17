FROM node:19.6.0-alpine AS build 
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install
COPY . /usr/src/app/

##FROM build as production

##ENV NODE_PATH=./build

##RUN npm run build


EXPOSE 3000
CMD ["npm", "start"]
