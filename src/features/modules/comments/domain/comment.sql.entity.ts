export class Comment {
  commentId: string; //PK
  postIdFk: string; //FK
  content: string;
  userIdFk: string; //FK
  createdAt: string;

  constructor(dto: Partial<Comment>) {
    this.postIdFk = dto.postIdFk;
    this.content = dto.content;
    this.userIdFk = dto.userIdFk;
    this.createdAt = dto.createdAt || new Date().toISOString();
  }
}
