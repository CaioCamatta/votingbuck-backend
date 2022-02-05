import { cleanEnv, port, str, url } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    DATABASE_URL: str(),
  });
};

export default validateEnv;
