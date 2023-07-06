FROM node:20.3.1 as build
WORKDIR /react-app

COPY package*.json .
COPY node_modules/pastecat-utils/config.js /
RUN npm install
COPY . .
RUN npm run build
RUN rm -f /config.js

FROM nginx:1.19
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /react-app/build /usr/share/nginx/html
