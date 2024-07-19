import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
//import { Post, PostDocument } from '../domain/post.entity';
import { Model } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../domain/post.sql.entity';
import { PostLikes } from '../../../likes/domain/like.sql.entity';
import { BlogCreateDto } from '../../blogs/api/models/input/blog.input.model';
import { BlogPostCreateDto } from '../api/models/input/post.input.model';

@Injectable()
export class PostRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async insertPost(post: Post) {
    const queryRunner = this.dataSource.createQueryRunner(); //создаем экземпляр запроса
    await queryRunner.startTransaction(); //начинаем транзакцию
    //console.log('Post object inside repository: ', post);
    try {
      const postResult = await queryRunner.query(
        `
          INSERT INTO "Posts" 
          ("title", "shortDescription", "content", "blogIdFk", "createdAtPost")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING "postId"
        `,
        [
          post.title,
          post.shortDescription,
          post.content,
          post.blogIdFk,
          post.createdAtPost,
        ],
      );
      await queryRunner.commitTransaction();
      //console.log('Post result inside blog repository: ', postResult[0]); // Возвращает id поста
      post.postId = postResult[0].postId;
      return post.postId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async find(postId: string) {
    const result = await this.dataSource.query(
      `
          SELECT p.*, b.name
          FROM "Posts" p
          LEFT JOIN "Blogs" b ON p."blogIdFk" = b."blogId"
          WHERE p."postId" = $1
        `,
      [postId],
    );
    if (result.length === 0) {
      return null; // Возвращаем null, если пользователь не найден
    }
    //console.log('Post result in find method: ', result[0]);
    return result.length ? result[0] : null;
  }

  async deletePostById(postId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.query(
        `
        DELETE FROM "Posts"
        WHERE "postId" = $1
        RETURNING "postId"
      `,
        [postId],
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
  async updatePostById(postId: string, postDto: BlogPostCreateDto) {
    const { title, shortDescription, content } = postDto;
    const query = `
      UPDATE "Posts"
      SET "title" = $1, "shortDescription" = $2, "content" = $3
      WHERE "postId" = $4
    `;
    try {
      const result = await this.dataSource.query(query, [
        title,
        shortDescription,
        content,
        postId,
      ]);
      // Assuming that the query returns an array where the first element is the number of affected rows
      return result[1] > 0;
    } catch (error) {
      throw new Error(`Failed to update blog with error: ${error.message}`);
    }
  }
  async updatePostLike(updateModel: PostLikes) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.query(
        `
            UPDATE "PostLikes"
            SET "likedUserLogin" = $1, "addedAt" = $2, "status" = $3
            WHERE "postId" = $4 AND "likedUserId" = $5
            RETURNING "postId", "likedUserId"
            `,
        [
          updateModel.likedUserLogin,
          updateModel.addedAt,
          updateModel.status,
          updateModel.postId,
          updateModel.likedUserId,
        ],
      );

      if (result.length === 0) {
        await queryRunner.query(
          `
                INSERT INTO "PostLikes" ("postId", "likedUserId", "likedUserLogin", "addedAt", "status")
                VALUES ($1, $2, $3, $4, $5)
                `,
          [
            updateModel.postId,
            updateModel.likedUserId,
            updateModel.likedUserLogin,
            updateModel.addedAt,
            updateModel.status,
          ],
        );
      }

      await queryRunner.commitTransaction();
      return true; // Возвращаем true, если операция успешна
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Failed to update or insert post like with error: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
  /*constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(PostLikes.name)
    private postLikesModel: Model<PostLikesDocument>,
  ) {}

  async insertPost(post: Post) {
    const result: PostDocument = await this.postModel.create(post);
    return result.id;
  }

  async find(postId: string): Promise<PostDocument> {
    return this.postModel.findById(postId).exec();
  }

  async deletePostById(postId: string) {
    try {
      const result = await this.postModel.findOneAndDelete({ _id: postId });
      return result.$isDeleted();
    } catch (error) {
      throw new Error(`Failed to delete blog with error ${error}`);
    }
  }
  async updatePostLike(updateModel: PostLikes) {
    const like = await this.postLikesModel.findOneAndUpdate(
      {
        $and: [
          { likedUserLogin: updateModel.likedUserLogin },
          { postId: updateModel.postId },
        ],
      },
      updateModel,
    );
    if (!like) {
      await this.postLikesModel.create(updateModel);
    }
    //return true;
  }*/
}
