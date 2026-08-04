# Billi Platform — single container running all 13 services + the public
# web server, exactly mirroring what `npm start` already does locally.
# Deliberately not a rewrite: same ts-node-dev processes, same local-file
# persistence, same service-to-service calls on localhost — just packaged
# to run on Cloud Run instead of a laptop.

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
# package.json — install dependencies (including devDependencies:
# ts-node-dev and typescript are required at runtime here, since these
# services transpile on the fly rather than shipping a separate build step).
RUN for svc in gateway orchestration-engine communication-engine incident-timeline \
               feedback-engine identity-service safety-protocol emergency-packet \
               capability-registry context-engine telemetry-processor \
               action-execution-engine observability; do \
      (cd services/$svc && npm install); \
    done

# Cloud Run injects the real $PORT at runtime; this is just a sane local
# default for anyone running the image directly.
ENV PORT=8099
EXPOSE 8099

CMD ["node", "start-cloud.js"]
