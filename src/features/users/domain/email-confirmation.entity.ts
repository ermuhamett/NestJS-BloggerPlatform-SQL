import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmailConfirmation {
  @PrimaryGeneratedColumn('uuid')
  emailId: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column()
  confirmationCode: string;

  @Column()
  confirmationCodeExpirationDate: Date;

  @Column({ nullable: true })
  passwordRecoveryCode: string;

  @Column({ nullable: true })
  passwordRecoveryCodeExpirationDate: Date;

  @Column({ default: false })
  isPasswordRecoveryConfirmed: boolean;
}
