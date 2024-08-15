import { PostCreateDto } from '../api/models/input/post.input.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../blogs/domain/blog.orm.entity';

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
/*@Schema()
export class Post {
  @Prop()
  title: string;

  @Prop()
  shortDescription: string;

  @Prop()
  content: string;

  @Prop()
  blogId: string;

  @Prop()
  blogName: string;

  @Prop()
  createdAt: string;

  constructor(data: PostCreateDto, blogName: string) {
    this.title = data.title;
    this.shortDescription = data.shortDescription;
    this.content = data.content;
    this.blogId = data.blogId;
    this.blogName = blogName;
    this.createdAt = new Date().toISOString();
  }

  // Метод для обновления данных поста
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
    if (updatedData.blogId) {
      this.blogId = updatedData.blogId;
    }
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post); //Необходима чтобы методы работали
export type PostDocument = HydratedDocument<Post>;*/
