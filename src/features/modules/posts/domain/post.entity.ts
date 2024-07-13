import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PostCreateDto } from '../api/models/input/post.input.model';

@Schema()
export class Post {
  @Prop()
  title: string;

  @Prop()
  shortDescription: string;

  @Prop()
  content: string;

  @Prop()
  blogId: string;

  @Prop()
  blogName: string;

  @Prop()
  createdAt: string;

  constructor(data: PostCreateDto, blogName: string) {
    this.title = data.title;
    this.shortDescription = data.shortDescription;
    this.content = data.content;
    this.blogId = data.blogId;
    this.blogName = blogName;
    this.createdAt = new Date().toISOString();
  }

  // Метод для обновления данных поста
  updatePost(updatedData: Partial<PostCreateDto>) {
    if (updatedData.title) {
      this.title = updatedData.title;
    }
    if (updatedData.shortDescription) {
      this.shortDescription = updatedData.shortDescription;
    }
    if (updatedData.content) {
      this.content = updatedData.content;
    }
    if (updatedData.blogId) {
      this.blogId = updatedData.blogId;
    }
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post); //Необходима чтобы методы работали
export type PostDocument = HydratedDocument<Post>;
