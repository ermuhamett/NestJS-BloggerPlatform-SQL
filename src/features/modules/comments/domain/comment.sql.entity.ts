export class Comment {
  commentId: string; //PK
  postIdFk: string; //FK
  content: string;
  userIdFk: string; //FK
  createdAt: string;
  login: string; //Появится после запроса из базы данных

  constructor(dto: Partial<Comment>) {
    this.postIdFk = dto.postIdFk;
    this.content = dto.content;
    this.userIdFk = dto.userIdFk;
    this.createdAt = dto.createdAt || new Date().toISOString();
  }
}
