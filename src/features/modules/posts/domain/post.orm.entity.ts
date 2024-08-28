import { PostCreateDto } from '../api/models/input/post.input.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../blogs/domain/blog.orm.entity';
import { PostLike } from '../../../likes/domain/postLikes.orm.entity';
import { Comment } from '../../comments/domain/comment.orm.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  postId: string; // PK

  @Column({ length: 35 })
  title: string;

  @Column({ length: 110 })
  shortDescription: string;

  @Column({ length: 1100 })
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column({ type: 'timestamp' })
  createdAt: string;

  // Add this relation to PostLikes
  @OneToMany(() => PostLike, (postLikes) => postLikes.post)
  likes: PostLike[];

  // Добавляем связь с Comment
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
  static createPost(data: PostCreateDto, blog: Blog) {
    const post = new Post();
    post.title = data.title;
    post.shortDescription = data.shortDescription;
    post.content = data.content;
    post.blog = blog; // Здесь указывается объект Blog, но сохраняется только blogId
    post.createdAt = new Date().toISOString();
    return post;
  }
  updatePost(updatedData: Partial<PostCreateDto>) {
    if (updatedData.title) {
      this.title = updatedData.title;
    }
    if (updatedData.shortDescription) {
      this.shortDescription = updatedData.shortDescription;
    }
    if (updatedData.content) {
      this.content = updatedData.content;
    }
  }
}
