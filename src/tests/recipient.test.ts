import request from 'supertest';
import App from '@/app';
import RecipientRoute from '@routes/recipient.route';

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing Recipients', () => {
  describe('[GET] /recipients/1', () => {
    it('returns status 200 and correct content', async () => {
      const recRoute = new RecipientRoute();
      const app = new App([recRoute]);

      const response = await request(app.getServer()).get(`${recRoute.path}/1`);

      expect(response.status).toEqual(200);
      expect(response.body.recInfo.id).toEqual('1');
    });
  });
});
