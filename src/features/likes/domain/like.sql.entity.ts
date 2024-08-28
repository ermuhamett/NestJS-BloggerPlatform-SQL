import { PostLikeDto } from '../../modules/posts/api/models/input/post.input.model';

export class PostLikes {
  postId: string;
  likedUserId: string;
  likedUserLogin: string;
  addedAt: string;
  status: string;
  constructor(dto: Partial<PostLikes>) {
    this.postId = dto.postId;
    this.likedUserId = dto.likedUserId;
    this.likedUserLogin = dto.likedUserLogin;
    this.addedAt = new Date().toISOString();
    this.status = dto.status;
  }
}

export class CommentLikes {
  authorId: string;
  parentId: string;
  status: string;
  createdAt: string;
  constructor(data: Partial<CommentLikes>) {
    this.authorId = data.authorId;
    this.parentId = data.parentId;
    this.status = data.status;
    this.createdAt = new Date().toISOString();
  }
}
