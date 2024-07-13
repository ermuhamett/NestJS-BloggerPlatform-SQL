import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '../infrastructure/comment.repository';
import { Comment } from '../domain/comment.entity';
import {
  CommentLikeDb,
  LikeInputDto,
  LikeStatus,
} from '../../../likes/api/models/likes.info.model';
import { CommentLikes } from '../../../likes/domain/like.entity';
import { CommentCreateDto } from '../api/models/input/comment.input.model';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async createComment(
    content: string,
    commentatorInfo: { id: string; login: string },
    postId: string,
  ) {
    const dto = {
      content,
      commentatorInfo: {
        userId: commentatorInfo.id,
        userLogin: commentatorInfo.login,
      },
      postId,
    };
    const newComment = new Comment(dto);
    return await this.commentRepository.createComment(newComment);
  }
  async updateCommentById(commentId: string, commentDto: CommentCreateDto) {
    const existingComment = await this.commentRepository.find(commentId);
    if (!existingComment) {
      throw new NotFoundException('Post not found in database');
    }
    existingComment.updateComment(commentDto);
    await existingComment.save();
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
