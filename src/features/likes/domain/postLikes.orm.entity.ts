import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from '../../modules/posts/domain/post.orm.entity';
import { User } from '../../users/domain/user.orm.entity';

@Entity()
export class PostLikes {
  @PrimaryColumn('uuid')
  postId: string;

  @PrimaryColumn('uuid')
  likedUserId: string;

  @Column({ length: 255 })
  likedUserLogin: string;

  @Column({ type: 'timestamp' })
  addedAt: string;

  @Column({ length: 255 })
  status: string;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => User, (user) => user.postLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'likedUserId' })
  user: User;

  static createLikeForPost(dto: Partial<PostLikes>) {
    const postLike = new PostLikes();
    if (dto) {
      postLike.postId = dto.postId;
      postLike.likedUserId = dto.likedUserId;
      postLike.likedUserLogin = dto.likedUserLogin;
      postLike.addedAt = dto.addedAt ?? new Date().toISOString();
      postLike.status = dto.status;
    }
  }
}
