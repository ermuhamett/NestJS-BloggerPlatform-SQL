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
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentQueryRepository } from '../infrastructure/comment.query.repository';
import { CommentCreateDto } from './models/input/comment.input.model';
import { AuthGuard } from '@nestjs/passport';
import { LikeInputDto } from '../../../likes/api/models/likes.info.model';
import { CommentExistenceGuard } from '../../../../common/guards/comment.existence.guard';
import { CommentService } from '../application/comment.service';
import { CommentOwnershipGuard } from '../../../../common/guards/comment.ownership.guard';
import { OptionalAuthGuard } from '../../../../common/guards/optional.auth.guard';
import { CommentRepository } from '../infrastructure/comment.repository';

ApiTags('Comments');
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly commentService: CommentService,
  ) {}
  @UseGuards(AuthGuard('jwt'), CommentExistenceGuard)
  // Проверка токена должна быть первой
  // Затем проверяется существование комментария
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body() likeDto: LikeInputDto,
  ) {
    await this.commentService.updateCommentLikeStatus(
      commentId,
      req.user.userId,
      likeDto,
    );
  }
  @UseGuards(AuthGuard('jwt'), CommentExistenceGuard, CommentOwnershipGuard)
  // Проверка токена должна быть первой
  // Затем проверяется существование комментария
  // Затем проверяется принадлежность комментария пользователю
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentById(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body() commentDto: CommentCreateDto,
  ) {
    await this.commentService.updateCommentById(commentId, commentDto);
  }

  //TODO нужно поставить проверку на то что существует ли данный комментарий в базе или нет как в постах
  @UseGuards(AuthGuard('jwt'), CommentExistenceGuard, CommentOwnershipGuard)
  //Все guard надо написать внутри одной UseGuards
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCommentById(@Param('commentId') commentId: string) {
    const comment = await this.commentRepository.find(commentId);
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    await this.commentService.deleteCommentById(commentId);
  }
  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Request() req, @Param('id') id: string) {
    return await this.commentQueryRepository.getCommentById(id, req.userId);
  }
}
