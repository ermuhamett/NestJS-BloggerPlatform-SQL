import { BlogDocument } from '../../../domain/blog.entity';
import { Blog } from '../../../domain/blog.sql.entity';

export class BlogOutputDto {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly websiteUrl: string,
    readonly createdAt: string,
    readonly isMembership: boolean,
  ) {}
}

export class BlogMapper {
  public static toView(blog: Blog): BlogOutputDto {
    return {
      id: blog.blogId,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAtBlog,
      isMembership: blog.isMembership,
    };
  }
}
