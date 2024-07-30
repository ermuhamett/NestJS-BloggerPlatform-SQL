import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmation } from './email-confirmation.entity';
import { UserCreateDto } from '../api/models/input/create-user.input.model';

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
  createdAt: Date;

  @ManyToOne(() => EmailConfirmation, { cascade: true })
  @JoinColumn({ name: 'emailConfirmationId' })
  emailConfirmation: EmailConfirmation;

  //Есть второй прикольный способ сделать с помощью BeforeInsert, но экспериментировать думаю не стоит
  constructor(data: UserCreateDto, passwordHash: string) {
    this.login = data.login;
    this.email = data.email;
    this.passwordHash = passwordHash;
    this.createdAt = new Date();
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
