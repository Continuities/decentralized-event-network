FROM node:latest AS dev

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD api/package.json /tmp/package.json
ADD api/yarn.lock /tmp/yarn.lock
RUN cd /tmp && \
    yarn install && \
    yarn add --force bcrypt && \
    mkdir -p /opt/api && \
    mv /tmp/node_modules /opt/api/

WORKDIR /opt/api

EXPOSE 8080
EXPOSE 9229

CMD [ "yarn", "start" ]


FROM dev as prod

COPY api /opt/api/
COPY activitypub /opt/api/node_modules/activitypub/

RUN yarn build

ENV NODE_ENV=production
USER node
CMD node ./dist/main.js
