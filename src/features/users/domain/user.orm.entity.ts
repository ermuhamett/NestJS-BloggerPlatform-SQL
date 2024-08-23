import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmation } from './email-confirmation.orm.entity';
import { UserCreateDto } from '../api/models/input/create-user.input.model';
import { Session } from '../../security/domain/security.orm.entity';
import { PostLike } from '../../likes/domain/postLikes.orm.entity';
import { Comment } from '../../modules/comments/domain/comment.orm.entity';
import { CommentLike } from '../../likes/domain/commentLikes.orm.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ collation: 'C' })
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: string;

  @OneToOne(() => EmailConfirmation, { cascade: true })
  @JoinColumn({ name: 'emailConfirmationId' })
  emailConfirmation: EmailConfirmation;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  // Add this relation to PostLikes
  @OneToMany(() => PostLike, (postLikes) => postLikes.likedUserId)
  postLikes: PostLike[];

  // Добавляем связь с Comment
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  //Добавляем связь с CommentLikes
  @OneToMany(() => CommentLike, (commentLikes) => commentLikes.author)
  commentLikes: CommentLike[];

  // If you also need the relationship for CommentLikes
  //@OneToMany(() => CommentLikes, (commentLikes) => commentLikes.author)
  //commentLikes: CommentLikes[];
  static create(userDto: UserCreateDto, passwordHash: string): User {
    const user = new User();
    user.login = userDto.login;
    user.email = userDto.email;
    user.passwordHash = passwordHash;
    user.createdAt = new Date().toISOString();

    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.isConfirmed = false;
    emailConfirmation.confirmationCode = uuidv4();
    emailConfirmation.confirmationCodeExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    emailConfirmation.isPasswordRecoveryConfirmed = false;

    user.emailConfirmation = emailConfirmation;
    return user;
  }
  updateConfirmationStatus() {
    this.emailConfirmation.isConfirmed = true;
  }

  updateEmailRecoveryData() {
    this.emailConfirmation.passwordRecoveryCode = uuidv4();
    this.emailConfirmation.passwordRecoveryCodeExpirationDate = add(
      new Date(),
      {
        hours: 1,
        minutes: 30,
      },
    );
    this.emailConfirmation.isPasswordRecoveryConfirmed = false;
  }

  updatePasswordRecoveryInfo(newPasswordHash: string) {
    this.passwordHash = newPasswordHash;
    this.emailConfirmation.isPasswordRecoveryConfirmed = true;
  }

  updateEmailConfirmationInfo() {
    this.emailConfirmation.isConfirmed = false;
    this.emailConfirmation.confirmationCode = uuidv4();
    this.emailConfirmation.confirmationCodeExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
  }
}
