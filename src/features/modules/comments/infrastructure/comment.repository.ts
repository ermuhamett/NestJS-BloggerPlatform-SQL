import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import {
  CommentLikes,
  CommentLikesDocument,
} from '../../../likes/domain/like.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(CommentLikes.name)
    private commentLikesModel: Model<CommentLikesDocument>,
  ) {}

  async createComment(comment: Comment) {
    const result: CommentDocument = await this.commentModel.create(comment);
    return result.id;
  }

  async find(commentId: string): Promise<CommentDocument> {
    return this.commentModel.findById(commentId).exec();
  }

  async updateLikeStatus(updatedLikeStatusDto: CommentLikes) {
    try {
      return await this.commentLikesModel.findOneAndUpdate(
        {
          authorId: updatedLikeStatusDto.authorId,
          parentId: updatedLikeStatusDto.parentId,
        },
        updatedLikeStatusDto,
        {
          new: true, // Возвращает обновленный документ
          upsert: true, // Создает новый документ, если он не найден
        },
      );
    } catch (error) {
      console.error('Error updating comment like:', error);
    }
  }
  async deleteCommentById(commentId: string) {
    try {
      const result = await this.commentModel.findOneAndDelete({
        _id: commentId,
      });
      return result.$isDeleted();
    } catch (error) {
      throw new Error(`Failed to delete blog with error ${error}`);
    }
  }
}
