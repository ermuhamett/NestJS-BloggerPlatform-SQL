import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Создание вложенной схемы CommentatorSchema
@Schema({ _id: false })
export class CommentatorInfo {
  @Prop()
  userId: string;

  @Prop()
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

// Создание основной схемы CommentsSchema
@Schema()
export class Comment {
  @Prop()
  postId: string;

  @Prop()
  content: string;

  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String })
  createdAt: string;
  constructor(dto: Partial<Comment>) {
    this.postId = dto.postId;
    this.content = dto.content;
    this.commentatorInfo = {
      userId: dto.commentatorInfo.userId,
      userLogin: dto.commentatorInfo.userLogin,
    } as CommentatorInfo;
    this.createdAt = dto.createdAt || new Date().toISOString();
  }

  updateComment(updatedData: Partial<Comment>) {
    if (updatedData.content) {
      this.content = updatedData.content;
    }
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
