import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogCreateDto } from '../../src/features/modules/blogs/api/models/input/blog.input.model';
import request from 'supertest';
import { BlogPostCreateDto } from '../../src/features/modules/posts/api/models/input/post.input.model';

export class BlogTestManager {
  protected readonly username: string = 'admin';
  protected readonly password: string = 'qwerty';
  constructor(protected readonly app: INestApplication) {}

  async createBlog(inputModelDto: BlogCreateDto, httpServer: any) {
    const res = await request(httpServer)
      .post(`/api/sa/blogs`)
      .auth(this.username, this.password)
      .send(inputModelDto)
      .expect(HttpStatus.CREATED);
    console.log('Create blog manager result: ', res.body);
    return res.body;
  }
  async getBlogById(id: string, httpServer: any) {
    return await request(httpServer)
      .get(`/api/posts/${id}`)
      .expect(HttpStatus.OK);
  }
  async createPostByBlog(
    blogId: string,
    inputModelDto: BlogPostCreateDto,
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

  async deletePostByBlog(blogId: string, postId: string, httpServer: any) {
    const res = await request(httpServer)
      .delete(`/api/sa/blogs/${blogId}/posts/${postId}`)
      .auth(this.username, this.password)
      .expect(HttpStatus.NO_CONTENT);
    console.log('Result of response delete operation ', res.body);
    return res.body;
  }
  async getPostById(id: string, httpServer: any) {
    const res = await request(httpServer).get(`/api/posts/${id}`).expect(404);
    console.log(res.body);
  }
}
