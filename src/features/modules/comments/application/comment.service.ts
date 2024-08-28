import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '../infrastructure/comment.repository';
import { LikeInputDto } from '../../../likes/api/models/likes.info.model';
import { CommentCreateDto } from '../api/models/input/comment.input.model';
import { Comment } from '../domain/comment.orm.entity';
import { CommentLike } from '../../../likes/domain/commentLikes.orm.entity';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async createComment(content: string, userId: string, postId: string) {
    const dto = {
      content,
      userId,
      postId,
    };
    const newComment = Comment.createComment(dto);
    console.log('Comment dto inside service: ', newComment);
    return await this.commentRepository.createComment(newComment);
  }
  //TODO Нужно поставить обновление для коммента, то есть через метод репозиторий
  async updateCommentById(commentId: string, commentDto: CommentCreateDto) {
    const existingComment = await this.commentRepository.find(commentId);
    if (!existingComment) {
      throw new NotFoundException('Comments not found in database');
    }
    existingComment.updateComment(commentDto);
    await this.commentRepository.save(existingComment);
    //await this.commentRepository.updateCommentById(commentId, commentDto);
  }
  async updateCommentLikeStatus(
    commentId: string,
    userId: string,
    payload: LikeInputDto,
  ) {
    const dto = CommentLike.createLikeForComment({
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
