import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentLikes } from '../../../likes/domain/like.sql.entity';
import { Comment } from '../domain/comment.orm.entity';
import { CommentLike } from '../../../likes/domain/commentLikes.orm.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikesRepository: Repository<CommentLike>,
  ) {}

  async createComment(commentData: Comment) {
    const comment = this.commentRepository.create(commentData);
    try {
      const savedComment = await this.commentRepository.save(comment);
      console.log(
        'Successful saved comment in database by id: ',
        savedComment.commentId,
      );
    } catch (error) {
      console.error(`Failed to create blog with error: ${error}`);
      return false;
    }
  }
  async find(commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { commentId },
    });
    if (!comment) {
      return null;
    }
    return comment;
  }

  async save(comment: Comment) {
    await this.commentRepository.save(comment);
  }

  async updateLikeStatus(updatedLikeStatusDto: CommentLikes) {
    const { authorId, parentId, status, createdAt } = updatedLikeStatusDto;
    try {
      // Найти существующий лайк
      const existingLike = await this.commentLikesRepository.findOne({
        where: { authorId, parentId },
      });
      if (existingLike) {
        // Обновить статус если уже существует
        existingLike.status = status;
        return await this.commentLikesRepository.save(existingLike);
      } else {
        // Создать новый если не существует
        const newLike = this.commentLikesRepository.create({
          authorId,
          parentId,
          status,
          createdAt,
        });
        return await this.commentLikesRepository.save(newLike);
      }
    } catch (error) {
      console.error('Error updating comment like:', error);
      throw error;
    }
  }
  async deleteCommentById(commentId: string) {
    try {
      const deleteResult = await this.commentRepository.delete({ commentId });
      return deleteResult.affected > 0; // Возвращаем true, если удаление успешно
    } catch (error) {
      throw new Error(`Failed to delete post with error: ${error}`);
    }
  }
  /*constructor(@InjectDataSource() private dataSource: DataSource) {}
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
  }*/
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
