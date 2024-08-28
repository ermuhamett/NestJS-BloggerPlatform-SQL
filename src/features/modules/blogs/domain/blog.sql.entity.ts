/*export class Blog {
  blogId: string; //PK
  name: string;
  description: string;
  websiteUrl: string;
  createdAtBlog: string;
  isMembership: boolean;

  constructor(data: Partial<Blog>) {
    this.name = data.name;
    this.description = data.description;
    this.websiteUrl = data.websiteUrl;
    this.createdAtBlog = new Date().toISOString();
    this.isMembership = false;
  }

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
  }
}*/
