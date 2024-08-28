import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../domain/blog.orm.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
  ) {}

  async insertBlog(blogData: Partial<Blog>) {
    const blog = this.blogRepository.create(blogData);
    try {
      const savedBlog = await this.blogRepository.save(blog);
      return savedBlog.blogId; // Возвращаем ID сохраненного блога
    } catch (error) {
      console.error(`Failed to create blog with error: ${error}`);
      return false;
    }
  }

  async deleteBlogById(blogId: string) {
    try {
      const deleteResult = await this.blogRepository.delete({ blogId });
      return deleteResult.affected > 0; // Возвращаем true, если удаление успешно
    } catch (error) {
      throw new Error(`Failed to delete blog with error: ${error}`);
    }
  }

  async find(blogId: string) {
    const blog = await this.blogRepository.findOne({ where: { blogId } });
    if (!blog) {
      return null;
    }
    return blog;
  }

  async save(blog: Blog) {
    await this.blogRepository.save(blog);
  }

  async blogExist(blogId: string) {
    try {
      return await this.blogRepository.exists({ where: { blogId } });
    } catch (error) {
      throw new Error(
        `Failed to check if blog exists with error: ${error.message}`,
      );
    }
  }
}
