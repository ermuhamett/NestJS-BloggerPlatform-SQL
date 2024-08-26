import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  LikeInputDto,
  LikeStatus,
} from '../../src/features/likes/api/models/likes.info.model';

export class LikeTestManager {
  constructor(protected readonly app: INestApplication) {}

  async updateLikeForPost(
    postId: string,
    token: string,
    likeStatus: LikeInputDto,
    httpServer: any,
  ) {
    const res = await request(httpServer)
      .put(`/api/posts/${postId}/like-status`)
      .auth(token, { type: 'bearer' })
      .send(likeStatus)
      .expect(HttpStatus.NO_CONTENT);
    console.log('Result of update like for post: ', res.body);
  }

  async updateLikeForComment(
    commentId: string,
    token: string,
    likeStatus: LikeInputDto,
    httpServer: any,
  ) {
    const res = await request(httpServer)
      .put(`/api/comments/${commentId}/like-status`)
      .auth(token, { type: 'bearer' })
      .send(likeStatus)
      .expect(HttpStatus.NO_CONTENT);
    console.log('Result of update like for post: ', res.body);
  }
}
