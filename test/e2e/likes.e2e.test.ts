import { INestApplication } from '@nestjs/common';
import { BlogTestManager } from '../utils/blog.test.manager';
import { initSettings } from '../utils/init-testings';
import request from 'supertest';
import { PostTestManager } from '../utils/post.test.manager';
import { CommentTestManager } from '../utils/comment.test.manager';
import { LikeTestManager } from '../utils/like.test.manager';
import { UserOutputDto } from '../../src/features/users/api/models/output/user.output.model';
import { AuthTestManger } from '../utils/auth.test.manger';
import {
  blogData,
  commentData,
  likeStatusLike,
  postDataForBlog,
  userData,
  userLoginData,
} from '../utils/datasets';
import { BlogOutputDto } from '../../src/features/modules/blogs/api/models/output/blog.output.model';
import { PostOutputDto } from '../../src/features/modules/posts/api/models/output/post.output.model';
import { EmailService } from '../../src/base/adapters/email/email.service';
import { CommentOutputDto } from '../../src/features/modules/comments/api/models/output/comment.output.model';
import { LikeStatus } from '../../src/features/likes/api/models/likes.info.model';

describe('Like for post and comments', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManger;
  let blogTestManager: BlogTestManager;
  let postTestManager: PostTestManager;
  let commentTestManager: CommentTestManager;
  let likeTestManager: LikeTestManager;
  let httpServer: string;
  let createdBlog: BlogOutputDto;
  let createdPost: PostOutputDto;
  let createdUser: UserOutputDto;
  let createdComment: CommentOutputDto;
  let bearerToken: string;

  const mockEmailService = {
    sendRegistrationEmail: jest.fn().mockResolvedValue(null),
  };
  beforeAll(async () => {
    const { app: initializedApp, httpServer: initializedHttpServer } =
      await initSettings({
        addSettingsToModuleBuilder: (moduleBuilder) => {
          moduleBuilder
            .overrideProvider(EmailService)
            .useValue(mockEmailService); // Применяем моки к тестовому модулю
        },
      });
    app = initializedApp;
    httpServer = initializedHttpServer;
    blogTestManager = new BlogTestManager(app);
    // Инициализируем тестовый менеджер
    authTestManager = new AuthTestManger(app);
    blogTestManager = new BlogTestManager(app);
    postTestManager = new PostTestManager(app);
    commentTestManager = new CommentTestManager(app);
    likeTestManager = new LikeTestManager(app);
    const response = await request(httpServer).delete('/api/testing/all-data');
    console.log(response.status);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('Create user flow', () => {
    it('should register new user', async () => {
      await authTestManager.registerUser(userData);
    });

    it('should login new user', async () => {
      const responseLogin = await authTestManager.login(userLoginData);
      expect(responseLogin).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      // Сохраняем token для использования в последующих тестах
      bearerToken = responseLogin.accessToken;
    });
  });
  describe('Post and blog flow', () => {
    it('should create new blog', async () => {
      createdBlog = await blogTestManager.createBlog(blogData, httpServer);
    });
    it('should create new post', async () => {
      createdPost = await postTestManager.createPost(
        postDataForBlog,
        createdBlog.id,
        httpServer,
      );
    });
  });
  describe('Comment flow', () => {
    it('should create new comment for post', async () => {
      createdComment = await commentTestManager.createComment(
        createdPost.id,
        bearerToken,
        commentData,
        httpServer,
      );
    });
  });
  describe('Like flow for post and comment', () => {
    it('should make like for created post', async () => {
      console.log('Данные поста: ', createdPost);
      await likeTestManager.updateLikeForPost(
        createdPost.id,
        bearerToken,
        likeStatusLike,
        httpServer,
      );
      // Получаем обновленный пост после лайка
      const updatedPost = await postTestManager.getUserPostById(
        createdPost.id,
        httpServer,
        bearerToken,
      );
      // Проверяем, что статус лайка обновился
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.LIKE);
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(1);
      expect(updatedPost.extendedLikesInfo.newestLikes.length).toBe(1);
      expect(updatedPost.extendedLikesInfo.newestLikes[0].login).toBeDefined(); // Проверяем, что информация о пользователе, поставившем лайк, есть
    });
  });
});
