import 'dotenv/config';
import '@/index';
import App from '@/app';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import OrganizationRoute from './routes/organization.route';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new OrganizationRoute()]);

app.listen();

// Export instantiate app so it's properties (e.g., db) can be accessed
export { app };
