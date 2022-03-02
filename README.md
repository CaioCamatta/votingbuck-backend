# 4470 Backend

Express.js API. Features:

- TypeScript
- Npm
- Nodemon for autorestart on file save
- ESLint and Prettier for linting + Husky & Staged-lint for auto-linting on git commit
- Jest for testing
- SWC compiler for building
- Swagger for pretty API (available under route /docs)
- Prisma (ORM)

Deployment:

- On AWS EC2
- Nginx (as reverse proxy, load balancer)
- Multi-stage Docker & Docker compose
- CI/CD for automatic test, build, and deployment

Based on this boilerplate: https://github.com/ljlm0402/typescript-express-starter

### Running the App

Use either `npm run dev` (dev) or `sudo docker-compose up -d --build` (prod containers).

### Database Changes:

According to the [Prisma docs](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/next-steps-typescript-postgres), whenever you change the database schema, you must

1.  Re-introspect your database with `npx prisma db pull`
2.  Optionally re-configure your Prisma client (`schema.prisma`)
3.  Re-generate Prisma Client with `npx prisma generate`
