import { LikesInfo } from '../../../../../likes/api/models/likes.info.model';
import { CommentDocument } from '../../../domain/comment.entity';

export interface ICommentatorInfo {
  userId: string;
  userLogin: string;
}
export class CommentOutputDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: ICommentatorInfo,
    public createdAt: string,
    public likesInfo: LikesInfo,
  ) {}
}

export class CommentMapper {
  public static toView(
    comment: CommentDocument,
    likes: LikesInfo,
  ): CommentOutputDto {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: likes,
    };
  }
}
