import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlogCreateDto } from '../api/models/input/blog.input.model';
import { Post } from '../../posts/domain/post.orm.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  blogId: string; //PK

  @Column({ collation: 'C' })
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  createdAt: string;

  @Column()
  isMembership: boolean;

  // Новое поле для связи "один ко многим" с Post
  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[]; // Массив постов, связанных с этим блогом
  static createBlog(blogDto: BlogCreateDto) {
    const blog = new Blog();
    blog.name = blogDto.name;
    blog.description = blogDto.description;
    blog.websiteUrl = blogDto.websiteUrl;
    blog.createdAt = new Date().toISOString();
    blog.isMembership = false;
    return blog;
  }

  public updateBlog(updatedData: Partial<Blog>) {
    if (updatedData.name) {
      this.name = updatedData.name;
    }
    if (updatedData.description) {
      this.description = updatedData.description;
    }
    if (updatedData.websiteUrl) {
      this.websiteUrl = updatedData.websiteUrl;
    }
    if (updatedData.isMembership !== undefined) {
      this.isMembership = updatedData.isMembership;
    }
  }
}
