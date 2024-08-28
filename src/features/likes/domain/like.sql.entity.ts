import { PostLikeDto } from '../../modules/posts/api/models/input/post.input.model';

export class PostLikes {
  postId: string;
  likedUserId: string;
  likedUserLogin: string;
  addedAt: string;
  status: string;
  constructor(dto: PostLikeDto) {
    this.postId = dto.postId;
    this.likedUserId = dto.userId;
    this.likedUserLogin = dto.userLogin;
    this.addedAt = new Date().toISOString();
    this.status = dto.status;
  }
}
