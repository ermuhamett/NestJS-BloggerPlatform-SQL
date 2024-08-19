import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../domain/post.orm.entity';
import { PostLikes } from '../../../likes/domain/postLikes.orm.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(PostLikes)
    private readonly postLikesRepository: Repository<PostLikes>,
  ) {}

  async insertPost(postData: Post) {
    const blog = this.postRepository.create(postData);
    try {
      const savedPost = await this.postRepository.save(blog);
      console.log(
        'Successful saved post in database by id: ',
        savedPost.postId,
      );
      return savedPost.postId; // Возвращаем ID сохраненного поста
    } catch (error) {
      console.error(`Failed to create blog with error: ${error}`);
      return false;
    }
  }

  /**
   * conditions — объект условий поиска, который динамически заполняется в зависимости от наличия blogId;
   * relations: ['blog'] — это опция для загрузки связанного блога, если нужна более подробная информация о нем
   */
  async find(postId: string, blogId?: string) {
    const conditions = { postId };
    if (blogId) {
      conditions['blog'] = { blogId };
    }
    const post = await this.postRepository.findOne({
      where: conditions,
      relations: ['blog'], // Если нужна дополнительная информация о блоге
    });

    return post || null;
  }

  async save(post: Post) {
    await this.postRepository.save(post);
  }

  async deletePostById(postId: string) {
    try {
      const deleteResult = await this.postRepository.delete({ postId });
      return deleteResult.affected > 0; // Возвращаем true, если удаление успешно
    } catch (error) {
      throw new Error(`Failed to delete post with error: ${error}`);
    }
  }

  //TODO Надо дописать данный метод так как уже есть сущность лайки для поста
  async updatePostLikes(updateModel: PostLikes) {
    // Пытаемся найти существующую запись в базе данных
    const existingLike = await this.postLikesRepository.findOne({
      where: {
        postId: updateModel.postId,
        likedUserId: updateModel.likedUserId,
      },
    });
    // Если запись существует, обновляем её
    if (existingLike) {
      existingLike.likedUserLogin = updateModel.likedUserLogin;
      existingLike.addedAt = updateModel.addedAt;
      existingLike.status = updateModel.status;
      await this.postLikesRepository.save(existingLike);
    } else {
      // Если записи нет, создаем новую
      await this.postLikesRepository.save(updateModel);
    }
    return true; // Возвращаем true, если операция успешна
  }
  /*constructor(@InjectDataSource() private dataSource: DataSource) {}

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
  //TODO Возможно в будущем придется два find писать. Один будет работать по blogId и postId а другой по postId только
  async find(postId: string, blogId?: string) {
    let query = `
    SELECT p.*, b.name
    FROM "Posts" p
    LEFT JOIN "Blogs" b ON p."blogIdFk" = b."blogId"
    WHERE p."postId" = $1
  `;
    // Добавляем условие для blogId, если оно предоставлено
    const params = [postId];
    if (blogId) {
      query += ` AND p."blogIdFk" = $2`;
      params.push(blogId);
    }
    const result = await this.dataSource.query(query, params);

    if (result.length === 0) {
      return null; // Возвращаем null, если пост не найден
    }

    return result[0];
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
      await queryRunner.query(
        `
      INSERT INTO "PostLikes" ("postId", "likedUserId", "likedUserLogin", "addedAt", "status")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("postId", "likedUserId")
      DO UPDATE SET
        "likedUserLogin" = EXCLUDED."likedUserLogin",
        "addedAt" = EXCLUDED."addedAt",
        "status" = EXCLUDED."status"
      `,
        [
          updateModel.postId,
          updateModel.likedUserId,
          updateModel.likedUserLogin,
          updateModel.addedAt,
          updateModel.status,
        ],
      );
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
  }*/
}
