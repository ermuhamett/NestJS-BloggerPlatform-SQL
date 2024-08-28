import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/domain/user.orm.entity';

/*@Entity()
export class CommentLikes {
  @PrimaryGeneratedColumn('uuid')
  likeId: string; // PK

  @ManyToOne(() => User, (user) => user.commentLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Column({ length: 255 })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  constructor(data: Partial<CommentLikes>) {
    if (data) {
      this.author = data.author;
      this.parent = data.parent;
      this.status = data.status;
      this.createdAt = data.createdAt ?? new Date().toISOString();
    }
  }
}*/
