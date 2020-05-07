#!/usr/bin/env bash
set -e

# Link local ActivityPub npm package
(cd activitypub && yarn link)
(cd app && yarn link "activitypub")
(cd api && yarn link "activitypub")

# Build app and api containers
docker-compose -f docker/docker-compose.dev.yml build

# Install dependencies for app
(cd app && yarn)

# Launch the db alone once and give it time to create db user and database
# This is a quickfix to avoid waiting for database to startup on first execution (more details [here](https://docs.docker.com/compose/startup-order/))

# docker-compose -f docker/docker-compose.dev.yml up -d db
# sleep 5
# docker-compose -f docker/docker-compose.dev.yml stop db
