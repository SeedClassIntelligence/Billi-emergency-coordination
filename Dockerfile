# Billi Platform — single container running all 13 services + the public
# web server, exactly mirroring what `npm start` already does locally,
# except each service is pre-compiled to plain JS at build time (tsc)
# instead of transpiling from TypeScript source on every cold start —
# same local-file persistence, same service-to-service calls on
# localhost, just packaged (and pre-built) to run on Cloud Run instead
# of a laptop.

FROM node:20-slim

WORKDIR /app

# Copy everything the running platform actually needs (see .dockerignore
# for what's excluded — node_modules, .git, .env, local .data/ state,
# the archived earlier-generation code, and docs that aren't needed at
# runtime).
COPY package.json ./
COPY start-cloud.js ./
COPY services/ ./services/
COPY web-app/ ./web-app/
COPY packages/ ./packages/
COPY tools/ ./tools/

# Each service is its own small Express/TypeScript app with its own
# package.json — install dependencies (including devDependencies, since
# typescript is required at build time here), then compile to dist/.
# start-cloud.js runs the compiled output (node dist/...), not
# ts-node-dev, so no on-the-fly transpilation happens at cold start.
RUN for svc in gateway orchestration-engine communication-engine incident-timeline \
               feedback-engine identity-service safety-protocol emergency-packet \
               capability-registry context-engine telemetry-processor \
               action-execution-engine observability; do \
      (cd services/$svc && npm install && npx tsc); \
    done

# Cloud Run injects the real $PORT at runtime; this is just a sane local
# default for anyone running the image directly.
ENV PORT=8099
EXPOSE 8099

CMD ["node", "start-cloud.js"]
