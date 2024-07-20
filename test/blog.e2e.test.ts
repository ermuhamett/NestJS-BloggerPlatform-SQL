import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app-setting';
import { useContainer } from 'class-validator';
import { initSettings } from './utils/init-testings';
import request from 'supertest';
import { BlogTestManager } from './utils/blog.test.manager';
import { BlogCreateDto } from '../src/features/modules/blogs/api/models/input/blog.input.model';
import { BlogPostCreateDto } from '../src/features/modules/posts/api/models/input/post.input.model';

describe('Blog entity test', () => {
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

  it('should create a new blog', async () => {
    const blogDto: BlogCreateDto = {
      name: 'Test Blog',
      description: 'A test blog description',
      websiteUrl: 'http://testblog.com',
    };
    createdBlog = await blogTestManager.createBlog(blogDto, httpServer);
    expect(createdBlog).toHaveProperty('id');
  });

  it('should create a new post in the blog', async () => {
    const postDto: BlogPostCreateDto = {
      title: 'Test Post',
      shortDescription: 'A test post short description',
      content: 'This is a test post content',
    };
    createdPost = await blogTestManager.createPostByBlog(
      createdBlog.id,
      postDto,
      httpServer,
    );
    expect(createdPost).toHaveProperty('id');
  });

  it('should delete the created post', async () => {
    await blogTestManager.deletePostByBlog(
      createdBlog.id,
      createdPost.id,
      httpServer,
    );
  });

  it('should verify the post is deleted', async () => {
    await blogTestManager.getPostById(createdPost.id, httpServer);
  });
});
