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
import { BlogRepository } from '../infrastructure/blog.repository';
import { BlogQueryRepository } from '../infrastructure/blog.query.repository';
import { PostService } from '../../posts/application/post.service';
import { PostQueryRepository } from '../../posts/infrastructure/post.query.repository';
import { AuthGuard } from '@nestjs/passport';
import { BlogCreateDto } from './models/input/blog.input.model';
import { BlogPostCreateDto } from '../../posts/api/models/input/post.input.model';
import {
  QueryInputType,
  QueryParams,
} from '../../../../base/adapters/query/query.class';
import { OptionalAuthGuard } from '../../../../common/guards/optional.auth.guard';
import { PostRepository } from '../../posts/infrastructure/post.repository';

@ApiTags('Admin Blogs')
@Controller('sa/blogs')
export class AdminBlogController {
  constructor(
    private blogService: BlogService,
    private blogRepository: BlogRepository,
    private blogQueryRepository: BlogQueryRepository,
    private postService: PostService,
    private postQueryRepository: PostQueryRepository,
    private postRepository: PostRepository,
  ) {}
  @UseGuards(AuthGuard('basic')) //hometask_18/api/sa/blogs
  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogsWithPagingBySa(@Query() query: QueryInputType) {
    const sanitizedQuery = new QueryParams(query).sanitize();
    return await this.blogQueryRepository.getBlogsWithPaging(sanitizedQuery);
    //work
  }
  @UseGuards(AuthGuard('basic')) ///hometask_18/api/sa/blogs post
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() blogDto: BlogCreateDto) {
    const blogId = await this.blogService.createBlog(blogDto);
    return await this.blogQueryRepository.getBlogById(blogId.toString());
  }
  @UseGuards(AuthGuard('basic')) ///hometask_18/api/sa/blogs/{blogId}/posts  post
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
  @UseGuards(AuthGuard('basic')) ///hometask_18/api/sa/blogs/{id} put
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogById(
    @Param('id') id: string,
    @Body() blogDto: BlogCreateDto,
  ) {
    const blog = await this.blogRepository.find(id);
    console.log('Blog inside put controller: ', blog);
    if (!blog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
    await this.blogService.updateBlogById(id, blogDto);
  }
  @UseGuards(AuthGuard('basic')) ///hometask_18/api/sa/blogs/{id} delete
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

  @UseGuards(AuthGuard('basic')) ///hometask_18/api/sa/blogs/{blogId}/posts GET
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
      req.userId,
    );
  }

  ///hometask_18/api/sa/blogs/{blogId}/posts/{postId} PUT
  @UseGuards(AuthGuard('basic'))
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostById(
    @Param('postId') postId: string,
    @Body() postDto: BlogPostCreateDto,
  ) {
    return this.postService.updatePostById(postId, postDto);
  }
  ///hometask_18/api/sa/blogs/{blogId}/posts/{postId} DELETE post by id
  @UseGuards(AuthGuard('basic'))
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(@Param('postId') postId: string) {
    const post = await this.postRepository.find(postId);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    await this.postService.deletePostById(postId);
  }
}
