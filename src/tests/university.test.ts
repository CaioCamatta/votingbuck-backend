import request from 'supertest';
import App from '@/app';
import UniversityRoute from '@routes/university.route';

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing Universities', () => {
  describe('[GET] /universities/3?start_date=2017-11-03&end_date=2018-11-03', () => {
    it('returns status 200 and correct content', async () => {
      const uniRoute = new UniversityRoute();
      const app = new App([uniRoute]);

      const response = await request(app.getServer()).get(`${uniRoute.path}/3?start_date=2017-11-03&end_date=2018-11-03`);

      expect(response.status).toEqual(200);
      expect(response.body.uniInfo.id).toEqual('3');
    });
  });
});

describe('Testing Universities List', () => {
  describe('[GET] /universities/list?states=MI,NY&sortField=name&order=asc', () => {
    it('returns status 200 and correct content', async () => {
      const uniRoute = new UniversityRoute();
      const app = new App([uniRoute]);

      const response = await request(app.getServer()).get(`${uniRoute.path}/list?states=MI,NY&sortField=name&order=asc`);

      for (const org of response.body.universities) {
        expect('id' in org).toEqual(true);
        expect('name' in org).toEqual(true);
        expect('location' in org).toEqual(true);
      }
      expect(response.status).toEqual(200);
    });
  });
});
