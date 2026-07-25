const request = require('supertest');
const app = require('./src/app');

describe('Trang web cơ bản', () => {
  it('GET / trả về status 200 và HTML chứa', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('<main class="main-content">');
  });
});
