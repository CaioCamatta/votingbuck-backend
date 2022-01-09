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

COPY --from=build-stage /app/dist ./dist

CMD ["node", "dist/server.js"]
