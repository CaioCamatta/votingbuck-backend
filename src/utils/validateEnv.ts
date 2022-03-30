import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    DATABASE_URL: str(),
    REDIS_HOST: str(),
    REDIS_PORT: port(),
    REDIS_INDEX_NAME: str(),
  });
};

export default validateEnv;
