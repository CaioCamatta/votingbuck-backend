import 'dotenv/config';
import '@/index';
import App from '@/app';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute()]);

app.listen();

// Export instantiate app so it's properties (e.g., db) can be accessed
export { app };
