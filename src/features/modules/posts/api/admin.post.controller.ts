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
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../application/post.service';
import { CommentService } from '../../comments/application/comment.service';
import { PostRepository } from '../infrastructure/post.repository';
import { PostQueryRepository } from '../infrastructure/post.query.repository';
import { CommentQueryRepository } from '../../comments/infrastructure/comment.query.repository';
import { UserRepositorySql } from '../../../users/infrastructure/user.repository';
import { AuthGuard } from '@nestjs/passport';
import { LikeInputDto } from '../../../likes/api/models/likes.info.model';
import { CommentCreateDto } from '../../comments/api/models/input/comment.input.model';
import { PostCreateDto } from './models/input/post.input.model';

@ApiTags('Admin Posts')
@Controller('sa/posts')
export class AdminPostController {
  //TODO Надо по сваггеру проверить роуты
  constructor(
    private postService: PostService,
    private commentService: CommentService,
    private postRepository: PostRepository,
    private postQueryRepository: PostQueryRepository,
    private commentQueryRepository: CommentQueryRepository,
    private userRepository: UserRepositorySql,
  ) {}
  @UseGuards(AuthGuard('jwt'))
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
  }
  @UseGuards(AuthGuard('jwt'))
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
  }
  @UseGuards(AuthGuard('basic'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() postDto: PostCreateDto) {
    const postId = await this.postService.createPost(postDto);
    if (!postId) {
      throw new HttpException(
        'Some error when created post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return await this.postQueryRepository.getPostById(postId.toString());
  }
  @UseGuards(AuthGuard('basic'))
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostById(
    @Param('id') id: string,
    @Body() postDto: PostCreateDto,
  ) {
    return this.postService.updatePostById(id, postDto);
    //Можно в контроллере не писать HttpException так как сервис может кинуть NotFound и контроллер автоматический обработает его
  }
  @UseGuards(AuthGuard('basic'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(@Param('id') id: string) {
    const post = await this.postRepository.find(id);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    await this.postService.deletePostById(id);
  }
}
