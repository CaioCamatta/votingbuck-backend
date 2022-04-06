import request from 'supertest';
import App from '@/app';
import RecipientRoute from '@routes/recipient.route';

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing Recipients', () => {
  describe('[GET] recipient data for id 1 from the 2017-2018 political period', () => {
    it('returns status 200 and correct content', async () => {
      const recRoute = new RecipientRoute();
      const app = new App([recRoute]);

      const response = await request(app.getServer()).get(`${recRoute.path}/1?start_date=2016-11-10&end_date=2018-11-10`);

      expect(response.status).toEqual(200);
      expect(response.body.recInfo.id).toEqual('1');
    });
  });
});

describe('Testing Recipients List', () => {
  describe('[GET] recipients from the states MI and NY, sorted by name in ascending order', () => {
    it('returns status 200 and correct content', async () => {
      const recRoute = new RecipientRoute();
      const app = new App([recRoute]);

      const response = await request(app.getServer()).get(`${recRoute.path}/list?states=MI,NY&sortField=name&order=asc`);

      for (const rec of response.body.recipients) {
        expect('id' in rec).toEqual(true);
        expect('name' in rec).toEqual(true);
        expect('state' in rec).toEqual(true);
      }
      expect(response.status).toEqual(200);
    });
  });
});
