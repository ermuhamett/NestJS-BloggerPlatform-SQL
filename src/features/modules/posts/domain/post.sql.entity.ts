import { PostCreateDto } from '../api/models/input/post.input.model';

export class Post {
  postId: string; //PK
  title: string;
  shortDescription: string;
  content: string;
  blogIdFk: string; //FK
  blogName: string;
  createdAt: string;

  constructor(data: PostCreateDto, blogName: string) {
    this.title = data.title;
    this.shortDescription = data.shortDescription;
    this.content = data.content;
    this.blogIdFk = data.blogId;
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
      this.blogIdFk = updatedData.blogId;
    }
  }
}
