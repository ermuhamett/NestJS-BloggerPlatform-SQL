import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/domain/user.orm.entity';
import { Post } from '../../posts/domain/post.orm.entity';
import { CommentLike } from '../../../likes/domain/commentLikes.orm.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  commentId: string;

  @Column({ type: 'uuid' })
  postId: string;

  @Column('text')
  content: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamp' })
  createdAt: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  // Добавляем связь с CommentLike
  @OneToMany(() => CommentLike, (commentLike) => commentLike.parent)
  likes: CommentLike[];
  static createComment(dto: Partial<Comment>) {
    const newComment = new Comment();
    newComment.postId = dto.postId;
    newComment.content = dto.content;
    newComment.userId = dto.userId;
    newComment.createdAt = dto.createdAt || new Date().toISOString();
    return newComment;
  }
  public updateComment(updatedData: Partial<Comment>) {
    if (updatedData.content) {
      this.content = updatedData.content;
    }
  }
}

/*@Schema({ _id: false })
export class CommentatorInfo {
  @Prop()
  userId: string;

  @Prop()
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

@Schema()
export class Comment {
  @Prop()
  postId: string;

  @Prop()
  content: string;

  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String })
  createdAt: string;
  constructor(dto: Partial<Comment>) {
    this.postId = dto.postId;
    this.content = dto.content;
    this.commentatorInfo = {
      userId: dto.commentatorInfo.userId,
      userLogin: dto.commentatorInfo.userLogin,
    } as CommentatorInfo;
    this.createdAt = dto.createdAt || new Date().toISOString();
  }

  updateComment(updatedData: Partial<Comment>) {
    if (updatedData.content) {
      this.content = updatedData.content;
    }
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;*/
