import 'dotenv/config';
import '@/index';
import App from '@/app';
import validateEnv from '@utils/validateEnv';
import OrganizationRoute from './routes/organization.route';
import RecipientRoute from './routes/recipient.route';
import SearchRoute from './routes/search.route';

validateEnv();

const app = new App([new OrganizationRoute(), new RecipientRoute(), new SearchRoute()]);

app.listen();

// Export instantiate app so it's properties (e.g., db) can be accessed
export { app };
