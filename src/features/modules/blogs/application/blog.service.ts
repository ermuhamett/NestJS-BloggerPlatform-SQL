import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogRepository } from '../infrastructure/blog.repository';
import { BlogCreateDto } from '../api/models/input/blog.input.model';
import { Blog } from '../domain/blog.orm.entity';

@Injectable()
export class BlogService {
  constructor(private blogRepository: BlogRepository) {}

  async createBlog(dto: BlogCreateDto) {
    const blog = Blog.createBlog(dto); //через конструктор класса
    const newBlogId = await this.blogRepository.insertBlog(blog);
    if (!newBlogId) {
      return {
        error: 'Ошибка при созданий блога',
      };
    }
    return newBlogId;
  }

  async updateBlogById(blogId: string, blogDto: BlogCreateDto) {
    const existingBlog = await this.blogRepository.find(blogId);
    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }
    existingBlog.updateBlog(blogDto);
    await this.blogRepository.save(existingBlog);
    //await existingBlog.save();
    //return await this.blogRepository.updateBlogById(blogId, blogDto)
  }

  async deleteBlogById(blogId: string) {
    return await this.blogRepository.deleteBlogById(blogId);
  }
}
