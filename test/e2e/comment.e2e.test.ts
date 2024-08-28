import { INestApplication } from '@nestjs/common';
import { BlogTestManager } from '../utils/blog.test.manager';
import { initSettings } from '../utils/init-testings';
import request from 'supertest';

describe('Comment entity test', () => {
  let app: INestApplication;
  let blogTestManager: BlogTestManager;
  let httpServer: string;
  let createdBlog: any;
  let createdPost: any;

  beforeAll(async () => {
    const { app: initializedApp, httpServer: initializedHttpServer } =
      await initSettings();
    app = initializedApp;
    httpServer = initializedHttpServer;
    blogTestManager = new BlogTestManager(app);
    const response = await request(httpServer).delete('/api/testing/all-data');
    console.log(response.status);
  });
  afterAll(async () => {
    await app.close();
  });
});
