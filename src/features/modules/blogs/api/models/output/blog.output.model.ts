import { BlogDocument } from '../../../domain/blog.entity';

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
  public static toView(blog: BlogDocument): BlogOutputDto {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
