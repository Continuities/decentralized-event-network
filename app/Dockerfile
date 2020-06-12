FROM node:latest AS build

WORKDIR /opt/app

COPY app /opt/app/
RUN yarn install

COPY activitypub /opt/app/node_modules/activitypub/
RUN cd node_modules/activitypub && yarn install && yarn build

RUN yarn build

FROM scratch as prod

COPY --from=build /opt/app/dist /opt/app/dist
