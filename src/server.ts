import 'dotenv/config';
import '@/index';
import App from '@/app';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import OrganizationRoute from './routes/organization.route';
import RecipientRoute from './routes/recipient.route';

validateEnv();

const app = new App([new UsersRoute(), new OrganizationRoute(), new RecipientRoute()]);

app.listen();

// Export instantiate app so it's properties (e.g., db) can be accessed
export { app };
