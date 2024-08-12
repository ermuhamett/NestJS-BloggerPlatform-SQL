import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BlogCreateDto } from '../api/models/input/blog.input.model';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  blogId: string; //PK

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  createdAt: string;

  @Column()
  isMembership: boolean;

  static createBlog(blogDto: BlogCreateDto) {
    const blog = new Blog();
    blog.name = blogDto.name;
    blog.description = blogDto.description;
    blog.websiteUrl = blogDto.websiteUrl;
    blog.createdAt = new Date().toISOString();
    blog.isMembership = false;
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
