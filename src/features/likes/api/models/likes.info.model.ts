import { IsEnum, IsString } from 'class-validator';

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class LikeInputDto {
  @IsString({ message: 'likeStatus must be a string' })
  @IsEnum(LikeStatus, {
    message: 'likeStatus must be one of: None, Like, Dislike',
  })
  likeStatus: LikeStatus;
}

export class NewestLike {
  constructor(
    public addedAt: string,
    public userId: string,
    public login: string,
  ) {}
}

export class LikesInfo {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: LikeStatus, // Используем новый тип
  ) {}
}

export class ExtendedLikesInfo {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: LikeStatus, // Используем новый тип
    public newestLikes: NewestLike[],
  ) {}
}

export class CommentLikeDb {
  authorId: string;
  parentId: string;
  status: string;
  //createdAt: string;
}
