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

      const response = await request(app.getServer()).get(`${orgRoute.path}/192108504?start_date=2017-11-03&end_date=2018-11-03`);

      expect(response.status).toEqual(200);
      expect(response.body.orgInfo.id).toEqual('192108504');
    });
  });
});

describe('Testing Organizations List', () => {
  describe('[GET] /organizations/list?industries=Railroads,Leisure%20Facilities&sortField=name&order=asc', () => {
    it('returns status 200 and correct content', async () => {
      const orgRoute = new OrganizationRoute();
      const app = new App([orgRoute]);

      const response = await request(app.getServer()).get(`${orgRoute.path}/list?industries=Railroads,Leisure%20Facilities&sortField=name&order=asc`);

      for (const org of response.body.organizations) {
        expect('id' in org).toEqual(true);
        expect('name' in org).toEqual(true);
        expect('industry' in org).toEqual(true);
      }
      expect(response.status).toEqual(200);
    });
  });
});
