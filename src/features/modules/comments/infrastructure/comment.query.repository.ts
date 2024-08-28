import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import { Model } from 'mongoose';
import { CommentMapper } from '../api/models/output/comment.output.model';
import {
  LikesInfo,
  LikeStatus,
} from '../../../likes/api/models/likes.info.model';
import { QueryOutputType } from '../../../../base/adapters/query/query.class';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async getCommentById(commentId: string, userId: string) {
    const commentQuery = `
      SELECT c."commentId", c."postIdFk", c."content", c."userIdFk", c."createdAt",
             u."login"
      FROM "Comments" c
      JOIN "Users" u ON c."userIdFk" = u."userId"
      WHERE c."commentId" = $1;
    `;
    const commentResult = await this.dataSource.query(commentQuery, [
      commentId,
    ]);

    if (commentResult.length === 0) {
      return null;
    }
    const comment = commentResult[0];
    //console.log('Comment object inside comment query repository: ', comment);
    const likes: LikesInfo = await this.getCommentLikes(commentId, userId);

    return CommentMapper.toView(comment, likes);
  }

  async getCommentLikes(commentId: string, userId?: string) {
    let likeStatus = LikeStatus.NONE; // Используйте соответствующий тип для likeStatus
    let userLikeQueryResult;
    try {
      // Если userId предоставлен, выполнить запрос на поиск лайка пользователя
      if (userId) {
        const userLikeQuery = `
          SELECT "status"
          FROM "CommentLikes"
          WHERE "parentId" = $1 AND "authorId" = $2;
        `;
        // Выполнение запроса для получения статуса лайка пользователя
        userLikeQueryResult = await this.dataSource.query(userLikeQuery, [
          commentId,
          userId,
        ]);
        // Если найден лайк пользователя, обновить likeStatus
        if (userLikeQueryResult.length > 0) {
          likeStatus = userLikeQueryResult[0].status;
        }
      }
      //Запросы для подсчета количества лайков и дизлайков
      const likesCountQuery = `
        SELECT COUNT(*) as count
        FROM "CommentLikes"
        WHERE "parentId" = $1 AND "status" = 'Like'
      `;
      const dislikesCountQuery = `
        SELECT COUNT(*) as count
        FROM "CommentLikes"
        WHERE "parentId" = $1 AND "status" = 'Dislike'
      `;
      // Выполнение запросов параллельно с использованием Promise.all
      const [likesCountResult, dislikesCountResult] = await Promise.all([
        this.dataSource.query(likesCountQuery, [commentId]),
        this.dataSource.query(dislikesCountQuery, [commentId]),
      ]);
      const likesCount = parseInt(likesCountResult[0].count, 10);
      const dislikesCount = parseInt(dislikesCountResult[0].count, 10);
      return {
        likesCount,
        dislikesCount,
        myStatus: likeStatus,
      };
    } catch (error) {
      console.error(
        `Error while getting likes for commentId ${commentId}: `,
        error,
      );
      throw error;
    }
  }
  async getCommentsWithPaging(
    query: QueryOutputType,
    postId?: string,
    userId?: string,
  ) {
    try {
      // Шаг 1: Подсчитать общее количество комментариев
      const countQuery = `
        SELECT COUNT(*) as count
        FROM "Comments"
        ${postId ? 'WHERE "postIdFk" = $1' : ''};
      `;
      const totalCountResult = await this.dataSource.query(
        countQuery,
        postId ? [postId] : [],
      );
      const totalCount = parseInt(totalCountResult[0].count, 10);
      const pageCount = Math.ceil(totalCount / query.pageSize);
      // Шаг 2: Выполнить запрос для получения комментариев с учетом пагинации и сортировки
      const commentsQuery = `
        SELECT c."commentId", c."postIdFk", c."content", c."userIdFk", c."createdAt",
               u."login"
        FROM "Comments" c
        JOIN "Users" u ON c."userIdFk" = u."userId"
        ${postId ? 'WHERE c."postIdFk" = $1' : ''}
        ORDER BY c."${query.sortBy}" ${query.sortDirection}
        OFFSET $2
        LIMIT $3;
      `;
      const commentsParams = postId
        ? [postId, (query.pageNumber - 1) * query.pageSize, query.pageSize]
        : [(query.pageNumber - 1) * query.pageSize, query.pageSize];
      const commentsResult = await this.dataSource.query(
        commentsQuery,
        commentsParams,
      );
      // Шаг 3: Получить информацию о лайках для каждого комментария
      const commentsIds = commentsResult.map((comment) => comment.commentId);
      const extendedLikesInfos = await Promise.all(
        commentsIds.map((commentId) => this.getCommentLikes(commentId, userId)),
      );
      // Шаг 4: Объединить комментарии с соответствующей информацией о лайках и вернуть результат
      const commentsWithLikeStatus = commentsResult.map((comment, index) => ({
        comment,
        extendedLikesInfo: extendedLikesInfos[index],
      }));
      return {
        pagesCount: pageCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: commentsWithLikeStatus.map((item) =>
          CommentMapper.toView(item.comment, item.extendedLikesInfo),
        ),
      };
    } catch (e) {
      console.log({ get_comments_query_repo: e });
      return false;
    }
  }
  /*constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(CommentLikes.name)
    private commentLikesModel: Model<CommentLikesDocument>,
  ) {}

  async getCommentById(commentId: string, userId?: string) {
    const comment = await this.commentModel.findOne({ _id: commentId });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const likes: LikesInfo = await this.getCommentLikes(commentId, userId);
    return CommentMapper.toView(comment, likes);
  }

  async getCommentLikes(commentId: string, userId?: string) {
    try {
      let likeStatus = LikeStatus.NONE;
      let userLike;
      // Если userId предоставлен, выполните запрос на поиск userLike
      if (userId) {
        userLike = await this.commentLikesModel
          .findOne({ parentId: commentId, authorId: userId })
          .lean();
        if (userLike) {
          likeStatus = userLike.status;
        }
      }
      // Запрос для получения всех необходимых данных с использованием Promise.all
      const [likesCount, dislikesCount] = await Promise.all([
        this.commentLikesModel.countDocuments({
          parentId: commentId,
          status: LikeStatus.LIKE,
        }),
        this.commentLikesModel.countDocuments({
          parentId: commentId,
          status: LikeStatus.DISLIKE,
        }),
      ]);
      return {
        likesCount,
        dislikesCount,
        myStatus: likeStatus,
      };
    } catch (error) {
      console.error(
        `Error while getting likes for commentId ${commentId}: `,
        error,
      );
      throw error;
    }
  }

  async getCommentsWithPaging(
    query: QueryOutputType,
    postId?: string,
    userId?: string,
  ) {
    const byId = postId ? { postId: postId } : {};
    const totalCount = await this.commentModel.countDocuments(byId);
    const pageCount = Math.ceil(totalCount / query.pageSize);
    try {
      const comments: CommentDocument[] = await this.commentModel
        .find(byId)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip((query.pageNumber - 1) * query.pageSize)
        .limit(query.pageSize);
      // Создаем массив который содержит идентификаторы комментариев чтобы по нему найти лайки и сразу их склеить
      const commentsIds = comments.map((comment) => comment.id.toString());
      // Запрашивает информацию о лайках для каждого коммента параллельно, используя Promise.all.
      const extendedLikesInfos = await Promise.all(
        commentsIds.map((commentId) => this.getCommentLikes(commentId, userId)),
      );
      // Создает массив объектов, содержащих посты и соответствующую информацию о лайках.
      const commentsWithLikeStatus = comments.map((comment, index) => ({
        comment,
        extendedLikesInfo: extendedLikesInfos[index],
      }));
      return {
        pagesCount: pageCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: commentsWithLikeStatus.map((item) =>
          CommentMapper.toView(item.comment, item.extendedLikesInfo),
        ),
      };
    } catch (e) {
      console.log({ get_comments_repo: e });
      return false;
    }
  }*/
}
