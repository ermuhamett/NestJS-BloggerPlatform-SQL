import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { BlogCreateDto } from '../api/models/input/blog.input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../domain/blog.sql.entity';
import { log } from 'console';

@Injectable()
export class BlogRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async insertBlog(blog: Partial<Blog>) {
    const queryRunner = this.dataSource.createQueryRunner(); //создаем экземпляр запроса
    await queryRunner.startTransaction(); //начинаем транзакцию
    //console.log('Blog object inside repository: ', blog);
    try {
      const blogResult = await queryRunner.query(
        `
          INSERT INTO "Blogs" 
          ("name", "description", "websiteUrl", "createdAtBlog", "isMembership")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING "blogId"
        `,
        [
          blog.name,
          blog.description,
          blog.websiteUrl,
          blog.createdAtBlog,
          blog.isMembership,
        ],
      );
      await queryRunner.commitTransaction();
      //console.log('Blog result inside blog repository: ', blogResult[0]); // Возвращает чисто id блога
      blog.blogId = blogResult[0].blogId;
      return blog.blogId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException();
    } finally {
      await queryRunner.release();
    }
  }

  async updateBlogById(blogId: string, blogDto: BlogCreateDto) {
    const { name, description, websiteUrl } = blogDto;
    const query = `
      UPDATE "Blogs"
      SET "name" = $1, "description" = $2, "websiteUrl" = $3
      WHERE "blogId" = $4
    `;
    try {
      const result = await this.dataSource.query(query, [
        name,
        description,
        websiteUrl,
        blogId,
      ]);
      // Assuming that the query returns an array where the first element is the number of affected rows
      return result[1] > 0;
    } catch (error) {
      throw new Error(`Failed to update blog with error: ${error.message}`);
    }
  }
  async deleteBlogById(blogId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.query(
        `
        DELETE FROM "Blogs"
        WHERE "blogId" = $1
        RETURNING "blogId"
      `,
        [blogId],
      );
      await queryRunner.commitTransaction();
      return result.length > 0; // Возвращаем true, если удаление успешно
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to update blog with error: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
  async find(blogId: string): Promise<Blog> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Blogs" WHERE "blogId" = $1`,
      [blogId],
    );
    return result.length ? result[0] : null;
  }
  async blogExist(blogId: string) {
    const query = `
      SELECT EXISTS(
        SELECT 1 
        FROM "Blogs" 
        WHERE "blogId" = $1
      ) AS "exists"
    `;
    try {
      const result = await this.dataSource.query(query, [blogId]);
      return result[0].exists;
    } catch (error) {
      throw new Error(
        `Failed to check if blog exists with error: ${error.message}`,
      );
    }
  }
  /*constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async insertBlog(blog: Partial<Blog>) {
    const result: BlogDocument = await this.blogModel.create(blog);
    return result.id;
  }
  async updateBlogById(blogId: string, blogDto: BlogCreateDto) {
    try {
      const result = await this.blogModel.findOneAndUpdate(
        { _id: new Types.ObjectId(blogId) },
        { $set: blogDto },
      );
      return result.isModified();
    } catch (error) {
      throw new Error(`Failed to update blog with error ${error}`);
    }
  }
  async deleteBlogById(blogId: string) {
    try {
      const result = await this.blogModel.findOneAndDelete({ _id: blogId });
      return result.$isDeleted();
    } catch (error) {
      throw new Error(`Failed to delete blog with error ${error}`);
    }
  }
  async find(blogId: string): Promise<BlogDocument> {
    return this.blogModel.findById(blogId).exec();
  }
  async blogExist(blogId: ObjectId) {
    return this.blogModel.exists({ _id: blogId }); //Метод для кастомного декортора
  }*/
}
