import { BlogCreateDto } from 'src/features/modules/blogs/api/models/input/blog.input.model';
import { BlogPostCreateDto } from '../../src/features/modules/posts/api/models/input/post.input.model';
import { CommentCreateDto } from '../../src/features/modules/comments/api/models/input/comment.input.model';
import {
  LikeInputDto,
  LikeStatus,
} from '../../src/features/likes/api/models/likes.info.model';
import { UserCreateDto } from '../../src/features/users/api/models/input/create-user.input.model';
import { LoginInputDto } from '../../src/features/auth/api/models/input/create-auth.input.model';

export const blogData: BlogCreateDto = {
  name: 'new blog',
  description: 'description',
  websiteUrl: 'https://someurl.com',
};

export const updatedBlogData: BlogCreateDto = {
  name: 'Updated Blog',
  description: 'Updated Description',
  websiteUrl: 'https://updatedblog.com',
};

export const userData: UserCreateDto = {
  login: 'Ezekiel07',
  password: '123456',
  email: 'fixit_montrey@gmail.com',
};

export const userLoginData: LoginInputDto = {
  loginOrEmail: 'Ezekiel07',
  password: '123456',
};
export const postDataForBlog: BlogPostCreateDto = {
  title: 'Post Title',
  shortDescription: 'Short Description',
  content: 'Content',
};

export const commentData: CommentCreateDto = {
  content: 'This post is so realistic and great, i like it',
};

export const likeStatusLike: LikeInputDto = {
  likeStatus: LikeStatus.LIKE,
};
export const likeStatusDislike: LikeInputDto = {
  likeStatus: LikeStatus.DISLIKE,
};
