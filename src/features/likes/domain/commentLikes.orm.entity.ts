import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.orm.entity';
import { Comment } from '../../modules/comments/domain/comment.orm.entity';

@Entity()
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  likeId: string; // PK

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'uuid' })
  parentId: string;

  @Column({ type: 'varchar', length: 255 })
  status: string;

  @Column({ type: 'timestamp' })
  createdAt: string;

  @ManyToOne(() => User, (user) => user.commentLikes, { onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  parent: Comment;
  static createLikeForComment(data: Partial<CommentLike>) {
    if (data) {
      const newCommentLike = new CommentLike();
      newCommentLike.authorId = data.authorId;
      newCommentLike.parentId = data.parentId;
      newCommentLike.status = data.status;
      newCommentLike.createdAt = data.createdAt ?? new Date().toISOString();
      return newCommentLike;
    }
  }
}
