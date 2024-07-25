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
import { QueryOutputType } from '../../../../base/adapters/query/query.class';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getPostById(postId: string, userId?: string): Promise<PostOutputDto> {
    const post = await this.dataSource.query(
      `
          SELECT p.*, b.name
          FROM "Posts" p
          LEFT JOIN "Blogs" b ON p."blogIdFk" = b."blogId"
          WHERE p."postId" = $1
        `,
      [postId],
    );
    //console.log('Post in getBlogById: ', post[0]);
    if (post.length === 0) {
      return null;
    }
    const likes: ExtendedLikesInfo = await this.getPostLikes(postId, userId);
    return PostMapper.toView(post[0], likes);
  }

  async getPostLikes(postId: string, userId?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      let likeStatus: LikeStatus = LikeStatus.NONE;
      let userLike;
      if (userId) {
        const userLikeResult = await queryRunner.query(
          `
                SELECT "status" FROM "PostLikes"
                WHERE "postId" = $1 AND "likedUserId" = $2
                `,
          [postId, userId],
        );
        if (userLikeResult.length > 0) {
          userLike = userLikeResult[0];
          likeStatus = userLike.status;
        }
      }
      const [likesCountResult, dislikesCountResult, newestLikesResult] =
        await Promise.all([
          queryRunner.query(
            `
                SELECT COUNT(*) AS "count" FROM "PostLikes"
                WHERE "postId" = $1 AND "status" = $2
                `,
            [postId, 'Like'],
          ),
          queryRunner.query(
            `
                SELECT COUNT(*) AS "count" FROM "PostLikes"
                WHERE "postId" = $1 AND "status" = $2
                `,
            [postId, 'Dislike'],
          ),
          queryRunner.query(
            `
                SELECT "likedUserLogin", "addedAt", "likedUserId" FROM "PostLikes"
                WHERE "postId" = $1 AND "status" = $2
                ORDER BY "addedAt" DESC
                LIMIT 3
                `,
            [postId, 'Like'],
          ),
        ]);
      const likesCount = parseInt(likesCountResult[0].count, 10);
      const dislikesCount = parseInt(dislikesCountResult[0].count, 10);
      const newestLikes = newestLikesResult.map(NewestLikesMapper.toView);
      return {
        likesCount,
        dislikesCount,
        myStatus: likeStatus,
        newestLikes,
      };
    } catch (error) {
      console.error(`Error while getting likes for postId ${postId}: `, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async getPostsWithPaging(
    query: QueryOutputType,
    blogId?: string,
    userId?: string,
  ) {
    try {
      // Подготовка условий поиска по blogId
      const byIdCondition = blogId ? `WHERE "blogIdFk" = $1` : '';
      // Подсчет общего количества записей
      const totalCountQuery = `
            SELECT COUNT(*) AS "totalCount"
            FROM "Posts"
            ${byIdCondition}
        `;
      const totalCountParams = blogId ? [blogId] : [];
      const totalCountResult = await this.dataSource.query(
        totalCountQuery,
        totalCountParams,
      );
      const totalCount = parseInt(totalCountResult[0].totalCount, 10);
      const pageCount = Math.ceil(totalCount / query.pageSize);
      // Определение правильного столбца сортировки
      const sortColumn =
        query.sortBy === 'createdAt' ? 'createdAtPost' : query.sortBy;
      const sortCondition =
        sortColumn === 'blogName'
          ? `b."name" ${query.sortDirection}`
          : `p."${sortColumn}" ${query.sortDirection}`;
      const offset = (query.pageNumber - 1) * query.pageSize;
      const limit = query.pageSize;
      // Получение записей с учетом поиска, сортировки, пропуска и лимита
      const selectQuery = `
            SELECT p.*, b.name
            FROM "Posts" p
            LEFT JOIN "Blogs" b ON p."blogIdFk" = b."blogId" 
            ${byIdCondition}
            ORDER BY ${sortCondition}
            OFFSET $${byIdCondition ? 2 : 1}
            LIMIT $${byIdCondition ? 3 : 2}
        `;
      const selectParams = byIdCondition
        ? [...totalCountParams, offset, limit]
        : [offset, limit];
      const posts = await this.dataSource.query(selectQuery, selectParams);
      // Получение дополнительной информации о лайках
      const postIds = posts.map((post) => post.postId);
      const extendedLikesInfos = await Promise.all(
        postIds.map((postId) => this.getPostLikes(postId, userId)),
      );
      // Объединение постов с информацией о лайках
      const extendedLikesList = posts.map((post, index) => ({
        post,
        extendedLikesInfo: extendedLikesInfos[index],
      }));
      // Возвращение результата с пагинацией
      return {
        pagesCount: pageCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: extendedLikesList.map((item) =>
          PostMapper.toView(item.post, item.extendedLikesInfo),
        ),
      };
    } catch (error) {
      console.error('Error while fetching posts with paging:', error);
      throw error;
    }
  }
  /*constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(PostLikes.name)
    private postLikesModel: Model<PostLikesDocument>,
  ) {}

  async find(id: string) {
    try {
      return await this.postModel.findById(id, { __v: false });
    } catch (e) {
      return false;
    }
  }

  async getPostById(postId: string, userId?: string): Promise<PostOutputDto> {
    const post = await this.find(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const likes: ExtendedLikesInfo = await this.getPostLikes(postId, userId);
    return PostMapper.toView(post, likes);
  }

  async getPostLikes(postId: string, userId?: string) {
    try {
      let likeStatus = LikeStatus.NONE;
      let userLike;
      // Если userId предоставлен, выполните запрос на поиск userLike
      if (userId) {
        userLike = await this.postLikesModel
          .findOne({ postId, likedUserId: userId })
          .lean();
        if (userLike) {
          likeStatus = userLike.status;
        }
      }
      // Запрос для получения всех необходимых данных с использованием Promise.all
      const [likesCount, dislikesCount, newestLikes] = await Promise.all([
        this.postLikesModel.countDocuments({ postId, status: LikeStatus.LIKE }),
        this.postLikesModel.countDocuments({
          postId,
          status: LikeStatus.DISLIKE,
        }),
        this.postLikesModel
          .find({ postId, status: LikeStatus.LIKE })
          .sort({ addedAt: -1 })
          .limit(3)
          .lean(),
      ]);
      return {
        likesCount,
        dislikesCount,
        myStatus: likeStatus,
        newestLikes: newestLikes.map(NewestLikesMapper.toView),
      };
    } catch (error) {
      console.error(`Error while getting likes for postId ${postId}: `, error);
      throw error;
    }
  }

  async getPostsWithPaging(
    query: QueryOutputType,
    blogId?: string,
    userId?: string,
  ) {
    const byId = blogId ? { blogId: blogId } : {};
    const totalCount = await this.postModel.countDocuments(byId);
    const pageCount = Math.ceil(totalCount / query.pageSize);
    try {
      const posts: PostDocument[] = await this.postModel
        .find(byId)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip((query.pageNumber - 1) * query.pageSize)
        .limit(query.pageSize);
      // Создает массив строковых идентификаторов постов.
      const postIds = posts.map((post) => post.id.toString());
      // Запрашивает информацию о лайках для каждого поста параллельно, используя Promise.all.
      const extendedLikesInfos = await Promise.all(
        postIds.map((postId) => this.getPostLikes(postId, userId)),
      );
      // Создает массив объектов, содержащих посты и соответствующую информацию о лайках.
      const extendedLikesList = posts.map((post, index) => ({
        post,
        extendedLikesInfo: extendedLikesInfos[index],
      }));
      return {
        pagesCount: pageCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: extendedLikesList.map((item) =>
          PostMapper.toView(item.post, item.extendedLikesInfo),
        ),
      };
    } catch (e) {
      console.log({ get_post_query_repo: e });
      return false;
    }
  }*/
}
