import request from 'supertest';
import App from '@/app';
import SearchRoute from '@routes/search.route';
import { RESULTS_PER_CATEGORY } from '@services/search.service';

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Test Search', () => {
  describe('[GET] empty search', () => {
    it('returns status 200 and max number of results', async () => {
      const route = new SearchRoute();
      const app = new App([route]);

      const response = await request(app.getServer()).get(`${route.path}/`);

      expect(response.status).toEqual(200);
      expect(response.body.politicians).toHaveLength(RESULTS_PER_CATEGORY);
      expect(response.body.corporates).toHaveLength(RESULTS_PER_CATEGORY);
      expect(response.body.universities).toHaveLength(RESULTS_PER_CATEGORY);
    });
  });
});