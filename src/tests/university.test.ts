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
