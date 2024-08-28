import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.orm.entity';
import {
  CommentMapper,
  CommentOutputDto,
} from '../api/models/output/comment.output.model';
import {
  LikesInfo,
  LikeStatus,
} from '../../../likes/api/models/likes.info.model';
import {
  PagingResult,
  QueryOutputType,
} from '../../../../base/adapters/query/query.class';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CommentLike } from '../../../likes/domain/commentLikes.orm.entity';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentQueryRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikesRepository: Repository<CommentLike>,
  ) {}

  async getCommentById(commentId: string, userId: string) {
    const comment = await this.commentQueryRepository.findOne({
      where: { commentId },
      relations: ['user'], // Загрузка связанного пользователя
      select: {
        commentId: true,
        postId: true,
        content: true,
        userId: true,
        createdAt: true,
        user: {
          login: true,
        },
      },
    });
    if (!comment) {
      return null;
    }
    console.log('Comment object inside comment query repository: ', comment);
    const likes: LikesInfo = await this.getCommentLikes(commentId, userId);
    return CommentMapper.toView(comment, likes);
  }

  async getCommentLikes(commentId: string, userId: string) {
    const likeStatus = await this.getUserCommentLikeStatus(commentId, userId);
    const [likesCount, dislikesCount] = await this.getCommentLikesInfo(
      commentId,
    );
    return {
      likesCount,
      dislikesCount,
      myStatus: likeStatus,
    };
  }
  private async getUserCommentLikeStatus(
    commentId: string,
    userId?: string,
  ): Promise<LikeStatus> {
    if (!userId) return LikeStatus.NONE;
    const userLike = await this.commentLikesRepository.findOne({
      where: {
        parentId: commentId,
        authorId: userId,
      },
      select: ['status'],
    });
    return (userLike?.status as LikeStatus) || LikeStatus.NONE;
  }
  private async getCommentLikesInfo(
    commentId: string,
  ): Promise<[number, number]> {
    return await Promise.all([
      this.commentLikesRepository.count({
        where: { parentId: commentId, status: LikeStatus.LIKE },
      }),
      this.commentLikesRepository.count({
        where: { parentId: commentId, status: LikeStatus.DISLIKE },
      }),
    ]);
  }
  //TODO Надо дописать paging для комментов а потом фиксить сервисы
  async getCommentsWithPaging(
    query: QueryOutputType,
    postId?: string,
    userId?: string,
  ): Promise<PagingResult<CommentOutputDto>> {
    try {
      // Предварительные расчеты и настройки
      const sortBy = query.sortBy;
      const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
      const offset = (query.pageNumber - 1) * query.pageSize;
      const limit = query.pageSize;
      // Фильтрация по postId
      const where: FindOptionsWhere<Comment> = postId ? { postId } : {};
      // Подсчет общего количества комментариев
      const totalCount = await this.commentQueryRepository.count({ where });
      const pageCount = Math.ceil(totalCount / query.pageSize);
      // Получение комментариев с пагинацией и сортировкой
      const comments = await this.commentQueryRepository.find({
        where,
        order: { [sortBy]: sortDirection },
        skip: offset,
        take: limit,
        relations: ['user'], // Загрузка пользователя вместе с комментарием
      });
      // Шаг 2: Получение ID комментариев для дальнейшей обработки
      const commentIds = comments.map((comment) => comment.commentId);
      // Шаг 3: Получение информации о лайках для каждого комментария
      const extendedLikesInfos = await Promise.all(
        commentIds.map((commentId) => this.getCommentLikes(commentId, userId)),
      );
      // Шаг 4: Объединение комментариев с соответствующей информацией о лайках
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
      console.log({ get_comments_query_repo: e });
    }
  }
}
