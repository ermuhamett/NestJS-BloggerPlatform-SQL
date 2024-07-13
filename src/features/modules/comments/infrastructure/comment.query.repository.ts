import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import { Model } from 'mongoose';
import {
  CommentLikes,
  CommentLikesDocument,
} from '../../../likes/domain/like.entity';
import { CommentMapper } from '../api/models/output/comment.output.model';
import {
  LikesInfo,
  LikeStatus,
} from '../../../likes/api/models/likes.info.model';
import { QueryOutputType } from '../../../../base/adapters/query/query.class';

@Injectable()
export class CommentQueryRepository {
  constructor(
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
  }
}
