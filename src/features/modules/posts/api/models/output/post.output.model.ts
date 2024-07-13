import { PostDocument } from '../../../domain/post.entity';
import {
  ExtendedLikesInfo,
  NewestLike,
} from '../../../../../likes/api/models/likes.info.model';
import { PostLikesDocument } from '../../../../../likes/domain/like.entity';

export class PostOutputDto {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: ExtendedLikesInfo,
  ) {}
}

export class PostMapper {
  public static toView(
    post: PostDocument,
    likes: ExtendedLikesInfo,
  ): PostOutputDto {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt, // Добавляем createdAt,
      extendedLikesInfo: likes,
    };
  }
}

export class NewestLikesMapper {
  public static toView(like: PostLikesDocument): NewestLike {
    return {
      addedAt: like.addedAt,
      userId: like.likedUserId,
      login: like.likedUserLogin,
    };
  }
}
