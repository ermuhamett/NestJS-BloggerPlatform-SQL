import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { Post, PostSchema } from './posts/domain/post.entity';
import { BlogController } from './blogs/api/blog.controller';
import { BlogService } from './blogs/application/blog.service';
import { PostService } from './posts/application/post.service';
import { BlogRepository } from './blogs/infrastructure/blog.repository';
import { BlogQueryRepository } from './blogs/infrastructure/blog.query.repository';
import { PostRepository } from './posts/infrastructure/post.repository';
import { PostQueryRepository } from './posts/infrastructure/post.query.repository';
import {
  CommentLikes,
  CommentLikesSchema,
  PostLikes,
  PostLikesSchema,
} from '../likes/domain/like.entity';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { PostController } from './posts/api/post.controller';
import { CommentQueryRepository } from './comments/infrastructure/comment.query.repository';
import { CommentController } from './comments/api/comment.controller';
import { BasicStrategy } from '../../common/strategies/basic.strategy';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { OptionalAuthGuard } from '../../common/guards/optional.auth.guard';
import { AuthModule } from '../auth/api/auth.module';
import { CommentService } from './comments/application/comment.service';
import { CommentRepository } from './comments/infrastructure/comment.repository';
import { UserModule } from '../users/api/user.module';
import { CommentExistenceGuard } from '../../common/guards/comment.existence.guard';
import { CommentOwnershipGuard } from '../../common/guards/comment.ownership.guard';

const blogProviders: Provider[] = [
  BlogService,
  BlogRepository,
  BlogQueryRepository,
];

const postProviders: Provider[] = [
  PostService,
  PostRepository,
  PostQueryRepository,
];
const commentProviders: Provider[] = [
  CommentService,
  CommentRepository,
  CommentQueryRepository,
];
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: PostLikes.name, schema: PostLikesSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLikes.name, schema: CommentLikesSchema },
    ]),
    AuthModule,
    UserModule,
  ],
  controllers: [BlogController, PostController, CommentController],
  providers: [
    ...blogProviders,
    ...postProviders,
    ...commentProviders,
    BasicStrategy,
    JwtStrategy,
    OptionalAuthGuard,
    CommentExistenceGuard,
    CommentOwnershipGuard,
  ],
  exports: [BlogRepository], //Экспортируем чтобы использовать для кастом декоратора
})
export class BlogsModule {}
