import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from '../application/blog.service';
import { BlogRepository } from '../infrastructure/blog.repository';
import { BlogQueryRepository } from '../infrastructure/blog.query.repository';
import { PostService } from '../../posts/application/post.service';
import { PostQueryRepository } from '../../posts/infrastructure/post.query.repository';
import { OptionalAuthGuard } from '../../../../common/guards/optional.auth.guard';
import {
  QueryInputType,
  QueryParams,
} from '../../../../base/adapters/query/query.class';

@ApiTags('Public Blogs')
@Controller('blogs')
export class PublicBlogController {
  constructor(
    private blogService: BlogService,
    private blogRepository: BlogRepository,
    private blogQueryRepository: BlogQueryRepository,
    private postService: PostService,
    private postQueryRepository: PostQueryRepository,
  ) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param('id') id: string) {
    console.log('Param id inside request: ', id);
    const blog = await this.blogRepository.find(id);
    console.log('Blog in getMethod: ', blog);
    if (!blog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
    return await this.blogQueryRepository.getBlogById(blog.blogId.toString());
    //work
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogsWithPaging(@Query() query: QueryInputType) {
    const sanitizedQuery = new QueryParams(query).sanitize();
    return await this.blogQueryRepository.getBlogsWithPaging(sanitizedQuery);
    //work
  }
  @UseGuards(OptionalAuthGuard)
  @Get(':blogId/posts')
  async getPostsForBlog(
    @Request() req,
    @Param('blogId') blogId: string,
    @Query() query: QueryInputType,
  ) {
    const blog = await this.blogRepository.find(blogId);
    if (!blog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
    const sanitizedQuery = new QueryParams(query).sanitize();
    return await this.postQueryRepository.getPostsWithPaging(
      sanitizedQuery,
      blogId,
      req.userId.toString(),
    );
  }
}
