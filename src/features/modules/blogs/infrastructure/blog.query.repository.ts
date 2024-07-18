import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogMapper,
  BlogOutputDto,
} from '../api/models/output/blog.output.model';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { QueryOutputType } from '../../../../base/adapters/query/query.class';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getBlogById(blogId: string): Promise<BlogOutputDto> {
    const blog = await this.dataSource.query(
      `
      SELECT *
      FROM "Blogs"
      WHERE "blogId" = $1
    `,
      [blogId],
    );
    if (blog.length === 0) {
      return null;
    }
    console.log('Blog data in getBlogById: ', blog[0]);
    return BlogMapper.toView(blog[0]);
  }
  /*constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getBlogById(blogId: string): Promise<BlogOutputDto | boolean> {
    const blog = await this.blogModel.findOne({ _id: blogId });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return BlogMapper.toView(blog);
  }
  async getBlogsWithPaging(query: QueryOutputType) {
    const search = query.searchNameTerm
      ? { name: { $regex: query.searchNameTerm, $options: 'i' } }
      : {};
    const totalCount = await this.blogModel.countDocuments(search);
    const pageCount = Math.ceil(totalCount / query.pageSize);
    try {
      const items: BlogDocument[] = await this.blogModel
        .find(search)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip((query.pageNumber - 1) * query.pageSize)
        .limit(query.pageSize);
      return {
        pagesCount: pageCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: items.map(BlogMapper.toView),
      };
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }*/
}
