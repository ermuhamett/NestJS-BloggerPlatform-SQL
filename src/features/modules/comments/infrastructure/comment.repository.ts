import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import { Comment, CommentDocument } from '../domain/comment.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Comment } from '../domain/comment.sql.entity';
import { CommentLikes } from '../../../likes/domain/like.sql.entity';
import { CommentCreateDto } from '../api/models/input/comment.input.model';

@Injectable()
export class CommentRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createComment(comment: Comment) {
    const query = `
      INSERT INTO "Comments" ("postIdFk", "content", "userIdFk", "createdAt")
      VALUES ($1, $2, $3, $4)
      RETURNING "commentId";
    `;
    const parameters = [
      comment.postIdFk,
      comment.content,
      comment.userIdFk,
      comment.createdAt,
    ];

    const result = await this.dataSource.query(query, parameters);
    //console.log('Comment data inside repository after created: ', result[0]);
    return result[0].commentId;
  }
  async find(commentId: string) {
    const query = `
      SELECT 
        c."commentId",
        c."postIdFk",
        c."content",
        c."createdAt",
        u."userId",
        u."login"
      FROM "Comments" c
      JOIN "Users" u ON c."userIdFk" = u."userId"
      WHERE c."commentId" = $1;
    `;
    const parameters = [commentId];

    const result = await this.dataSource.query(query, parameters);
    if (result.length === 0) {
      return null;
    }
    console.log('Comment after find in database: ', result[0]);
    return result[0];
  }
  async updateCommentById(commentId: string, updatedDto: CommentCreateDto) {
    const query = `
      UPDATE "Comments"
      SET "content" = $1
      WHERE "commentId" = $2
    `;
    try {
      const result = await this.dataSource.query(query, [
        updatedDto.content,
        commentId,
      ]);
      // Assuming that the query returns an array where the first element is the number of affected rows
      return result[1] > 0;
    } catch (error) {
      throw new Error(`Failed to update comment with error: ${error.message}`);
    }
  }
  async updateLikeStatus(updatedLikeStatusDto: CommentLikes) {
    const query = `
      INSERT INTO "CommentLikes" ("authorId", "parentId", "status", "createdAt")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("authorId", "parentId")
      DO UPDATE SET "status" = EXCLUDED."status"
      RETURNING "likeId", "authorId", "parentId", "status", "createdAt";
    `;
    const parameters = [
      updatedLikeStatusDto.authorId,
      updatedLikeStatusDto.parentId,
      updatedLikeStatusDto.status,
      updatedLikeStatusDto.createdAt,
    ];
    try {
      const result = await this.dataSource.query(query, parameters);
      return result[0];
    } catch (error) {
      console.error('Error updating comment like:', error);
      throw error;
    }
  }
  async deleteCommentById(commentId: string) {
    const deleteQuery = `
      DELETE FROM "Comments"
      WHERE "commentId" = $1
      RETURNING "commentId";
    `;
    const parameters = [commentId];
    try {
      const result = await this.dataSource.query(deleteQuery, parameters);
      return result.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete comment with error: ${error}`);
    }
  }
  /*constructor(
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
  }*/
}
