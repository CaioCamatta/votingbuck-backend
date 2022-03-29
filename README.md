# Voting Buck Backend

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

### RedisSearch

To set up the RedisSearch index, do this only once:

    FT.CREATE index ON HASH PREFIX 1 entity SCORE 0.000001 SCORE_FIELD score STOPWORDS 0 SCHEMA name TEXT NOSTEM SORTABLE category TAG  id NUMERIC

Then, to add a politician/university/corporate, use

    HSET search:<pol/uni/cor>:<entitys_id> name "<name>" category <politician/university/corporate> id <entitys_id> score <score>

where

- `<name>` is the entity's name, like "Joe Biden" or "Apple"
- `<entitys_id>` is the pol/uni/cor's id in the SQL database
- `<score>` is a number between 0.0 and 1.0 corresponding to their score

Example

    HSET entity:pol:42 name "Donald Trump" category politician id 42 score 0.978777

See section below for information on Score.

The index must be populated once every time the SQL database is change. (Or whenever it is empty)

To search, use

    FT.SEARCH index "(%<query[term_n]>%|%<query[term_n]>%|query*) @category:{<politician/university/corporate>}" SCORER DOCSCORE LIMIT 0 <max_results>

Example for query "joe bide"

    FT.SEARCH index "(%joe%|%bide%|joe bide*) @category:{politician}" SCORER DOCSCORE LIMIT 0 2

(returns Joe Biden; read about [query syntax](https://oss.redis.com/redisearch/Query_Syntax))

To populate the RedisSearch index, a function exists in search.services code that is called once every time the app starts if the index is empty/non-existent.

#### Score

We want to rank entities (pol/org/unis) higher if they are more likely to be one that is interesting. For example, a popular politician should rank higher in search results than one that isn't well-known. To achieve that, we use our own scoring function.

Each one of the three categories of entities has its own scoring criteria

- Universities: univeristy ranking
- Corpotates: number of revolvers
- Politicians: wealth

These are not perfect criteria, but they are all attributes of the `organization` or `politician` table, so easy to fetch. Ideally, we would want the score to be the amount of money an entity has donated (in the case of corporates or unis) or received (politicians), but that is a wish-list suggestion for the future.

The formula to calculate the scores for each entity type is:

- Universities: `1 - (1/(1 + x/<AVERAGE ranking, e.g. 100>)) × 0.9`
- Corpotates: `1 - (1/(1 + x/<AVERAGE number of revolvers, e.g. 100>)) × 0.9`
- Politicians: `1 - (1/(1 + x/<AVERAGE wealth, e.g. 100>)) × 0.9`

Scores must be between 0.o and 1.0. The above functions map everything to in the [0, 1.0) range.
