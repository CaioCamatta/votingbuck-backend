import request from 'supertest';
import App from '@/app';
import RecipientRoute from '@routes/recipient.route';

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing Recipients', () => {
  describe('[GET] /recipients/1?start_date=2017-11-03&end_date=2018-11-03', () => {
    it('returns status 200 and correct content', async () => {
      const recRoute = new RecipientRoute();
      const app = new App([recRoute]);

      const response = await request(app.getServer()).get(`${recRoute.path}/1?start_date=2017-11-03&end_date=2018-11-03`);

      expect(response.status).toEqual(200);
      expect(response.body.recInfo.id).toEqual('1');
    });
  });
});

describe('Testing Recipients List', () => {
  describe('[GET] /recipients/list?states=MI,NY&sortField=name&order=asc', () => {
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
