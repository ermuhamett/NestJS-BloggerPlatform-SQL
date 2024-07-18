import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
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

@ApiTags('Admin Blogs')
@Controller('sa/blogs')
export class AdminBlogController {
  constructor(
    private blogService: BlogService,
    private blogRepository: BlogRepository,
    private blogQueryRepository: BlogQueryRepository,
    private postService: PostService,
    private postQueryRepository: PostQueryRepository,
  ) {}
  @UseGuards(AuthGuard('basic'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() blogDto: BlogCreateDto) {
    console.log('In controller');
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
    console.log('Blog inside put controller: ', blog);
    if (!blog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
    await this.blogService.updateBlogById(id, blogDto);
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
