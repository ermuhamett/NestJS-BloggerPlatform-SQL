import { HttpStatus, INestApplication } from '@nestjs/common';
import { CommentCreateDto } from '../../src/features/modules/comments/api/models/input/comment.input.model';
import request from 'supertest';

export class CommentTestManager {
  constructor(protected readonly app: INestApplication) {}

  async createComment(
    postId: string,
    token: string,
    inputModelDto: CommentCreateDto,
    httpServer: any,
  ) {
    const res = await request(httpServer)
      .post(`/api/posts/${postId}/comments`)
      .auth(token, { type: 'bearer' })
      .send(inputModelDto)
      .expect(HttpStatus.CREATED);
    console.log('New comment created by user: ', res.body);
    return res.body;
  }

  async getCommentById(id: string, httpServer: any) {
    const res = await request(httpServer)
      .get(`/api/comments/${id}`)
      .expect(HttpStatus.OK);
    console.log('Get comments manager result: ', res.body);
    return res.body;
  }
}
