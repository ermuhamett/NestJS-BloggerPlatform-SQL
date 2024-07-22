import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../application/post.service';
import { CommentService } from '../../comments/application/comment.service';
import { PostRepository } from '../infrastructure/post.repository';
import { PostQueryRepository } from '../infrastructure/post.query.repository';
import { CommentQueryRepository } from '../../comments/infrastructure/comment.query.repository';
import { UserRepositorySql } from '../../../users/infrastructure/user.repository';
import { OptionalAuthGuard } from '../../../../common/guards/optional.auth.guard';
import {
  QueryInputType,
  QueryParams,
} from '../../../../base/adapters/query/query.class';

@ApiTags('Public Posts')
@Controller('posts')
export class PublicPostController {
  //TODO надо по сваггеру проверить роуты
  constructor(
    private postRepository: PostRepository,
    private postQueryRepository: PostQueryRepository,
    private commentQueryRepository: CommentQueryRepository,
  ) {}

  /*@UseGuards(OptionalAuthGuard)
  @Get(':postId/comments')
  @HttpCode(HttpStatus.OK)
  async getCommentsForPost(
    @Request() req,
    @Param('postId') postId: string,
    @Query() query: QueryInputType,
  ) {
    const post = await this.postRepository.find(postId);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const sanitizedQuery = new QueryParams(query).sanitize();
    return await this.commentQueryRepository.getCommentsWithPaging(
      sanitizedQuery,
      postId,
      req.userId,
    );
  }*/
  //TODO Like для поста
  /*@UseGuards(AuthGuard('jwt'))
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostLikeStatus(
    @Request() req,
    @Param('postId') postId: string,
    @Body() likeDto: LikeInputDto,
  ) {
    const post = await this.postRepository.find(postId);
    const user = await this.userRepository.find(req.user.userId);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return await this.postService.createLikePost(
      postId,
      likeDto.likeStatus,
      user.userId.toString(), //Обновлено
      user.login,
    );
  }*/

  //TODO Создания коммента для поста
  /*@UseGuards(AuthGuard('jwt'))
  @Post(':postId/comments')
  @HttpCode(HttpStatus.CREATED)
  async createCommentByPost(
    @Request() req,
    @Param('postId') postId: string,
    @Body() commentDto: CommentCreateDto,
  ) {
    const post = await this.postRepository.find(postId);
    const user = await this.userRepository.find(req.user.userId);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const newCommentId = await this.commentService.createComment(
      commentDto.content,
      { id: user.userId.toString(), login: user.login },
      postId,
    );
    return await this.commentQueryRepository.getCommentById(
      newCommentId,
      user.userId.toString(),
    );
  }*/
  @UseGuards(OptionalAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getPostsWithPaging(@Query() query: QueryInputType, @Request() req) {
    //const user = await this.userRepository.find(req.userId);
    const sanitizedQuery = new QueryParams(query).sanitize();
    console.log('UserId in controller: ', req.userId);
    return await this.postQueryRepository.getPostsWithPaging(
      sanitizedQuery,
      '',
      req.userId,
    );
  }
  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') id: string, @Request() req) {
    const post = await this.postQueryRepository.getPostById(id, req.userId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }
}
