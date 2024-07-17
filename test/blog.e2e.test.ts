import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app-setting';
import { useContainer } from 'class-validator';
import { initSettings } from './utils/init-testings';
import request from 'supertest';
import { BlogTestManager } from './utils/blog.test.manager';

describe('Blog entity test', () => {
  let app: INestApplication;
  let blogTestManager: BlogTestManager;
  let httpServer: string;

  beforeAll(async () => {
    const { app: initializedApp, httpServer: initializedHttpServer } =
      await initSettings();
    app = initializedApp;
    httpServer = initializedHttpServer;
    const response = await request(httpServer).delete('/api/testing/all-data');
    console.log(response.status);
  });
  afterAll(async () => {
    await app.close();
  });
});
