import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import { Model } from 'mongoose';
import {
  PostLikes,
  PostLikesDocument,
} from '../../../likes/domain/like.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(PostLikes.name)
    private postLikesModel: Model<PostLikesDocument>,
  ) {}

  async insertPost(post: Post) {
    const result: PostDocument = await this.postModel.create(post);
    return result.id;
  }

  async find(postId: string): Promise<PostDocument> {
    return this.postModel.findById(postId).exec();
  }

  async deletePostById(postId: string) {
    try {
      const result = await this.postModel.findOneAndDelete({ _id: postId });
      return result.$isDeleted();
    } catch (error) {
      throw new Error(`Failed to delete blog with error ${error}`);
    }
  }
  async updatePostLike(updateModel: PostLikes) {
    const like = await this.postLikesModel.findOneAndUpdate(
      {
        $and: [
          { likedUserLogin: updateModel.likedUserLogin },
          { postId: updateModel.postId },
        ],
      },
      updateModel,
    );
    if (!like) {
      await this.postLikesModel.create(updateModel);
    }
    //return true;
  }
}
