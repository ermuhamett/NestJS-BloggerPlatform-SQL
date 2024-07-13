import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../domain/post.entity';
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
  PostLikes,
  PostLikesDocument,
} from '../../../likes/domain/like.entity';
import { QueryOutputType } from '../../../../base/adapters/query/query.class';

@Injectable()
export class PostQueryRepository {
  constructor(
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
      console.log({ get_post_repo: e });
      return false;
    }
  }
}
