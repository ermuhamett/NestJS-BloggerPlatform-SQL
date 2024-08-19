import { Injectable } from '@nestjs/common';
import {
  NewestLikesMapper,
  PostMapper,
  PostOutputDto,
} from '../api/models/output/post.output.model';
import {
  ExtendedLikesInfo,
  LikeStatus,
} from '../../../likes/api/models/likes.info.model';
import {
  PagingResult,
  QueryOutputType,
} from '../../../../base/adapters/query/query.class';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Post } from '../domain/post.orm.entity';
import { PostLikes } from '../../../likes/domain/postLikes.orm.entity';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postQueryRepository: Repository<Post>,
    @InjectRepository(PostLikes)
    private readonly postLikesRepository: Repository<PostLikes>,
  ) {}

  async getPostById(postId: string, userId?: string) {
    const post = await this.postQueryRepository.findOne({
      where: { postId },
      relations: ['blog'], // Для связи с таблицей "Blogs"
    });
    console.log('Post inside getPostById: ', post);
    if (!post) {
      return null;
    }
    const likes: ExtendedLikesInfo = await this.getPostLikes(postId, userId);
    return PostMapper.toView(post, likes);
  }

  async getPostLikes(postId: string, userId?: string) {
    const likeStatus = await this.getUserLikeStatus(postId, userId);
    const [likesCount, dislikesCount, newestLikes] = await this.getLikesInfo(
      postId,
    );

    return {
      likesCount,
      dislikesCount,
      myStatus: likeStatus,
      newestLikes: newestLikes.map(NewestLikesMapper.toView),
    };
  }

  private async getUserLikeStatus(
    postId: string,
    userId?: string,
  ): Promise<LikeStatus> {
    if (!userId) return LikeStatus.NONE;
    const userLike = await this.postLikesRepository.findOne({
      where: {
        postId,
        likedUserId: userId,
      },
      select: ['status'],
    });
    return (userLike?.status as LikeStatus) || LikeStatus.NONE;
  }

  private async getLikesInfo(
    postId: string,
  ): Promise<[number, number, PostLikes[]]> {
    return await Promise.all([
      this.postLikesRepository.count({
        where: { postId, status: LikeStatus.LIKE },
      }),
      this.postLikesRepository.count({
        where: { postId, status: LikeStatus.DISLIKE },
      }),
      this.postLikesRepository.find({
        where: { postId, status: LikeStatus.LIKE },
        order: { addedAt: 'DESC' },
        take: 3,
        select: ['likedUserLogin', 'addedAt', 'likedUserId'],
      }),
    ]);
  }
  async getPostsWithPaging(
    query: QueryOutputType,
    blogId?: string,
    userId?: string,
  ): Promise<PagingResult<PostOutputDto>> {
    // Подготовка фильтров и настроек запроса
    const filter: FindOptionsWhere<Post> = {};
    if (blogId) {
      filter.blog = { blogId };
    }
    const sortBy = query.sortBy;
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const offset = (query.pageNumber - 1) * query.pageSize;
    const limit = query.pageSize;
    // Подсчет общего количества записей
    const totalCount = await this.postQueryRepository.count({ where: filter });
    // Подсчет количества страниц
    const pagesCount = Math.ceil(totalCount / limit);
    // Получение постов с учетом фильтрации, сортировки и пагинации
    try {
      const posts = await this.postQueryRepository.find({
        where: filter,
        order: { [sortBy]: sortDirection },
        skip: offset,
        take: limit,
        relations: ['blog'], // Подгружаем связанные данные, если необходимо
      });
      // Получение дополнительной информации о лайках
      const extendedLikesInfos = await Promise.all(
        posts.map((post) => this.getPostLikes(post.postId, userId)),
      );
      // Объединение постов с информацией о лайках
      const extendedLikesList = posts.map((post, index) => ({
        post,
        extendedLikesInfo: extendedLikesInfos[index],
      }));
      // Возвращение результата с пагинацией
      return {
        pagesCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: extendedLikesList.map((item) =>
          PostMapper.toView(item.post, item.extendedLikesInfo),
        ),
      };
    } catch (e) {
      console.log({ get_post_query_repo: e });
    }
  }
}
