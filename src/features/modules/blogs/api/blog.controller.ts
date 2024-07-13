import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from '../application/blog.service';
import { BlogCreateDto } from './models/input/blog.input.model';
import { BlogQueryRepository } from '../infrastructure/blog.query.repository';
import { BlogPostCreateDto } from '../../posts/api/models/input/post.input.model';
import { BlogRepository } from '../infrastructure/blog.repository';
import { PostService } from '../../posts/application/post.service';
import { PostQueryRepository } from '../../posts/infrastructure/post.query.repository';
import {
  QueryInputType,
  QueryParams,
} from '../../../../base/adapters/query/query.class';
import { AuthGuard } from '@nestjs/passport';
import { OptionalAuthGuard } from '../../../../common/guards/optional.auth.guard';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  constructor(
    private blogService: BlogService,
    private blogRepository: BlogRepository,
    private blogQueryRepository: BlogQueryRepository,
    private postService: PostService,
    private postQueryRepository: PostQueryRepository,
  ) {}

  ///TODO query репозиторий вернет ViewModel или OutputModel.
  // find нужно использовать внутри обычной репозиторий чтобы там получить hydrated document, то есть как промис вернется умный документ
  // entity можно добавить методы чтобы сразу создать или обновить их в сервисе, ну создать конечно неправильно будет но обновить это нормально
  @UseGuards(AuthGuard('basic'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() blogDto: BlogCreateDto) {
    const blogId = await this.blogService.createBlog(blogDto);
    return await this.blogQueryRepository.getBlogById(blogId.toString());
    //work
  }

  @UseGuards(AuthGuard('basic'))
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() postDto: BlogPostCreateDto,
  ) {
    const blog = await this.blogRepository.find(blogId);
    if (!blog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
    const createdPostId = await this.postService.createPost({
      ...postDto,
      blogId,
    });
    if (!createdPostId) {
      throw new HttpException(
        'Some error when created post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return await this.postQueryRepository.getPostById(createdPostId.toString());
    //work
  }

  @UseGuards(AuthGuard('basic'))
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogById(
    @Param('id') id: string,
    @Body() blogDto: BlogCreateDto,
  ) {
    const blog = await this.blogRepository.find(id);
    if (!blog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
    await this.blogService.updateBlogById(id, blogDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param('id') id: string) {
    const blog = await this.blogRepository.find(id);
    if (!blog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
    return await this.blogQueryRepository.getBlogById(blog.id.toString());
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

  @UseGuards(AuthGuard('basic'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('id') id: string) {
    const blog = await this.blogRepository.find(id);
    if (!blog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
    await this.blogService.deleteBlogById(id);
    //Тут вроде как возвращает false что неправильно наверное
    //work
  }
}
