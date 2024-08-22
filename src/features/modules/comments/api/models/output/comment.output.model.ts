import { LikesInfo } from '../../../../../likes/api/models/likes.info.model';
import { CommentDocument } from '../../../domain/comment.orm.entity';
import { Comment } from '../../../domain/comment.sql.entity';

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
  public static toView(comment: Comment, likes: LikesInfo): CommentOutputDto {
    return {
      id: comment.commentId.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userIdFk,
        userLogin: comment.login,
      },
      createdAt: comment.createdAt,
      likesInfo: likes,
    };
  }
}
