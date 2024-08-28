import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../infrastructure/post.repository';
import {
  BlogPostCreateDto,
  PostCreateDto,
} from '../api/models/input/post.input.model';
//import { Post } from '../domain/post.entity';
import { BlogRepository } from '../../blogs/infrastructure/blog.repository';
import { LikeStatus } from '../../../likes/api/models/likes.info.model';
import { PostLikes } from '../../../likes/domain/like.entity';
import { Post } from '../domain/post.sql.entity';

@Injectable()
export class PostService {
  constructor(
    private postRepository: PostRepository,
    private blogRepository: BlogRepository,
  ) {}

  async createPost(postDto: PostCreateDto) {
    const blog = await this.blogRepository.find(postDto.blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found in database');
    }
    const post = new Post(postDto, blog.name);
    /*const post:Post={
            title:postDto.title,
            shortDescription:postDto.shortDescription,
            content:postDto.content,
            blogId:postDto.blogId,
            blogName:blogName,
            createdAt:new Date().toISOString()
        }*/
    const newPostId = await this.postRepository.insertPost(post);
    if (!newPostId) {
      return {
        error: 'Ошибка при созданий поста',
      };
    }
    return newPostId;
  }
  async createLikePost(
    postId: string,
    status: LikeStatus,
    userId: string,
    userLogin: string,
  ) {
    const updatePostLike = new PostLikes({
      postId,
      status,
      userId,
      userLogin,
    });
    await this.postRepository.updatePostLike(updatePostLike);
  }
  async updatePostById(
    postId: string,
    postDto: BlogPostCreateDto,
    blogId: string,
  ) {
    const existingPost = await this.postRepository.find(postId, blogId);
    if (!existingPost) {
      throw new NotFoundException('Post not found in database');
    }
    //existingPost.updatePost(postDto);
    await this.postRepository.updatePostById(postId, postDto);
    //await existingPost.save();
  }
  async deletePostById(postId: string) {
    return await this.postRepository.deletePostById(postId);
  }
}
