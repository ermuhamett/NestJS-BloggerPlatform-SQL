import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  BlogPostCreateDto,
  PostCreateDto,
} from '../../src/features/modules/posts/api/models/input/post.input.model';
import request from 'supertest';

export class PostTestManager {
  protected readonly username: string = 'admin';
  protected readonly password: string = 'qwerty';

  constructor(protected readonly app: INestApplication) {}

  async createPost(
    inputModelDto: BlogPostCreateDto,
    blogId: string,
    httpServer: any,
  ) {
    const res = await request(httpServer)
      .post(`/api/sa/blogs/${blogId}/posts`)
      .auth(this.username, this.password)
      .send(inputModelDto)
      .expect(HttpStatus.CREATED);
    console.log('Create post manager result: ', res.body);
    return res.body;
  }

  async getPostById(postId: string, httpServer: any) {
    const res = await request(httpServer)
      .get(`/api/posts/${postId}`)
      .expect(HttpStatus.OK);
    console.log('Get post manager result: ', res.body);
    return res.body;
  }

  async getUserPostById(postId: string, httpServer: any, token: string) {
    const res = await request(httpServer)
      .get(`/api/posts/${postId}`)
      .auth(token, { type: 'bearer' }) // передаем токен в виде Bearer
      .expect(HttpStatus.OK);
    console.log('Post data for user: ', res.body);
    return res.body;
  }
}
