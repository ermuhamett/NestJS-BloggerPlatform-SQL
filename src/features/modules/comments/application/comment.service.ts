import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '../infrastructure/comment.repository';
//import { Comment } from '../domain/comment.entity';
import {
  CommentLikeDb,
  LikeInputDto,
  LikeStatus,
} from '../../../likes/api/models/likes.info.model';
import { CommentLikes } from '../../../likes/domain/like.entity';
import { CommentCreateDto } from '../api/models/input/comment.input.model';
import { Comment } from '../domain/comment.sql.entity';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async createComment(
    content: string,
    userId: string,
    //commentatorInfo: { id: string; login: string },
    postId: string,
  ) {
    const dto = {
      content,
      userIdFk: userId,
      postIdFk: postId,
    };
    const newComment = new Comment(dto);
    console.log('Comment dto inside service: ', newComment);
    return await this.commentRepository.createComment(newComment);
  }
  //TODO Нужно поставить обновление для коммента, то есть через метод репозиторий
  async updateCommentById(commentId: string, commentDto: CommentCreateDto) {
    const existingComment = await this.commentRepository.find(commentId);
    if (!existingComment) {
      throw new NotFoundException('Comments not found in database');
    }
    await this.commentRepository.updateCommentById(commentId, commentDto);
  }
  async updateCommentLikeStatus(
    commentId: string,
    userId: string,
    payload: LikeInputDto,
  ) {
    const dto = new CommentLikes({
      authorId: userId,
      parentId: commentId,
      status: payload.likeStatus,
    });
    return await this.commentRepository.updateLikeStatus(dto);
  }
  async deleteCommentById(commentId: string) {
    return await this.commentRepository.deleteCommentById(commentId);
  }
}
