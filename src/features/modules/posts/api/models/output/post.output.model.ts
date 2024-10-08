import {
  ExtendedLikesInfo,
  NewestLike,
} from '../../../../../likes/api/models/likes.info.model';
import { Post } from '../../../domain/post.orm.entity';
import { PostLike } from '../../../../../likes/domain/postLikes.orm.entity';

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
  public static toView(post: Post, likes: ExtendedLikesInfo): PostOutputDto {
    //console.log('Post data before mapping: ', post);
    return {
      id: post.postId,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blog.blogId,
      blogName: post.blog.name,
      createdAt: post.createdAt, // Добавляем createdAt,
      extendedLikesInfo: likes,
    };
  }
}

export class NewestLikesMapper {
  public static toView(like: PostLike): NewestLike {
    return {
      addedAt: like.addedAt,
      userId: like.likedUserId,
      login: like.likedUserLogin,
    };
  }
}
