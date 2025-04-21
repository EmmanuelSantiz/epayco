FROM node:16-alpine AS build

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and xml2js explicitly
RUN npm install && npm install xml2js && npm i --save-dev @types/xml2js

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM build as production

ENV NODE_PATH=./build

EXPOSE 3000
CMD ["npm", "start"]
