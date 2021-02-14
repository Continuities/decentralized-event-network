FROM node:latest AS build

WORKDIR /opt/app

COPY app /opt/app/
RUN yarn install

COPY activitypub /opt/app/node_modules/activitypub/
RUN cd node_modules/activitypub && yarn install && yarn build

RUN yarn build

FROM nginx:latest as prod

COPY --from=build /opt/app/dist /opt/app/dist
COPY /config/nginx.static.conf /etc/nginx/conf.d

EXPOSE 3000
