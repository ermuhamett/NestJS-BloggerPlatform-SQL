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

// Создание вложенной схемы EmailConfirmationSchema
/*@Schema({ _id: false })
export class EmailConfirmation {
  @Prop()
  isConfirmed: boolean;

  @Prop()
  confirmationCode: string;

  @Prop()
  confirmationCodeExpirationDate: Date;

  @Prop()
  passwordRecoveryCode: string;

  @Prop()
  passwordRecoveryCodeExpirationDate: Date;

  @Prop()
  isPasswordRecoveryConfirmed: boolean;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);

@Schema()
export class User {
  @Prop()
  login: string;

  @Prop()
  email: string;

  @Prop()
  passwordHash: string;

  @Prop()
  createdAt: string;

  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  constructor(data: UserCreateDto, passwordHash: string) {
    this.login = data.login;
    this.email = data.email;
    this.passwordHash = passwordHash;
    this.createdAt = new Date().toISOString();
    this.emailConfirmation = new EmailConfirmation();
    this.emailConfirmation.isConfirmed = false;
    this.emailConfirmation.confirmationCode = uuidv4();
    this.emailConfirmation.confirmationCodeExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    this.emailConfirmation.isPasswordRecoveryConfirmed = false;
  }

  updateConfirmationStatus() {
    this.emailConfirmation.isConfirmed = true;
  }
  updateEmailRecoveryData() {
    this.emailConfirmation.passwordRecoveryCode = uuidv4();
    this.emailConfirmation.passwordRecoveryCodeExpirationDate = add(
      new Date(),
      { hours: 1, minutes: 30 },
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

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
export type UserDocument = HydratedDocument<User>;*/
