# 4470 Backend

Express.js API. Features:

- TypeScript
- Npm
- Nodemon for autorestart on file save
- ESLint and Prettier for linting + Husky & Staged-lint for auto-linting on git commit
- Jest for testing
- SWC compiler for building
- Swagger for pretty API (available under route /api-docs)

Deployment:
 - On AWS EC2
 - Nginx (as reverse proxy, load balancer)
 - Multi-stage Docker & Docker compose
 - CI/CD for automatic test, build, and deployment

Based on this boilerplate: https://github.com/ljlm0402/typescript-express-starter
