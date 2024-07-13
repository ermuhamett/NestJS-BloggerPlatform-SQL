import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogCreateDto } from '../api/models/input/blog.input.model';

@Schema()
export class Blog {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  websiteUrl: string;

  @Prop()
  createdAt: string;

  @Prop()
  isMembership: boolean;

  constructor(data: BlogCreateDto) {
    this.name = data.name;
    this.description = data.description;
    this.websiteUrl = data.websiteUrl;
    this.createdAt = new Date().toISOString();
    this.isMembership = false;
  }
  // Метод для обновления данных блога
  updateBlog(updatedData: Partial<Blog>): void {
    if (updatedData.name) {
      this.name = updatedData.name;
    }
    if (updatedData.description) {
      this.description = updatedData.description;
    }
    if (updatedData.websiteUrl) {
      this.websiteUrl = updatedData.websiteUrl;
    }
    if (updatedData.isMembership !== undefined) {
      this.isMembership = updatedData.isMembership;
    }

    //await this.save()- Пасхалко от Влада(Save Record Pattern), extends Document надо юзать при классе
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
export type BlogDocument = HydratedDocument<Blog>;
