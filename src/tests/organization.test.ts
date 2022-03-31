import request from 'supertest';
import App from '@/app';
import OrganizationRoute from '@routes/organization.route';

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing Organizations', () => {
  describe('[GET] /organizations/192108504?start_date=2017-11-03&end_date=2018-11-03', () => {
    it('returns status 200 and correct content', async () => {
      const orgRoute = new OrganizationRoute();
      const app = new App([orgRoute]);

      const response = await request(app.getServer()).get(`${orgRoute.path}/1?start_date=2017-11-03&end_date=2018-11-03`);

      expect(response.status).toEqual(200);
      expect(response.body.orgInfo.id).toEqual('1');
    });
  });
});
