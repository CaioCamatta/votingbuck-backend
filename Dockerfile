# Build stage
FROM node:16.13.0-alpine3.14 as build-stage

WORKDIR /app
COPY . /app

EXPOSE 3000

RUN npm install
RUN npm run build


# Production build stage
FROM node:16.13.0-alpine3.14 as production-build-stage

COPY package*.json ./
RUN npm install --only=production
COPY --from=build-stage /app/node_modules/.prisma/client /node_modules/.prisma/client
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/swagger.yaml ./dist/swagger.yaml

CMD ["node", "dist/server.js"]
