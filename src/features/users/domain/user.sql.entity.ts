import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { UserCreateDto } from '../api/models/input/create-user.input.model';

export class EmailConfirmation {
  id: string; //PK
  isConfirmed: boolean;
  confirmationCode: string;
  confirmationCodeExpirationDate: Date;
  passwordRecoveryCode: string;
  passwordRecoveryCodeExpirationDate: Date;
  isPasswordRecoveryConfirmed: boolean;

  constructor() {
    this.isConfirmed = false;
    this.confirmationCode = uuidv4();
    this.confirmationCodeExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    this.isPasswordRecoveryConfirmed = false;
  }

  initEmailConfirmationData(data: Partial<EmailConfirmation>) {
    this.isConfirmed = data.isConfirmed;
    this.confirmationCode = data.confirmationCode;
    this.confirmationCodeExpirationDate = data.confirmationCodeExpirationDate;
    this.passwordRecoveryCode = data.passwordRecoveryCode;
    this.passwordRecoveryCodeExpirationDate =
      data.passwordRecoveryCodeExpirationDate;
    this.isPasswordRecoveryConfirmed = data.isPasswordRecoveryConfirmed;
  }
  ///TODO все методы просто удалять так как обновление без sql запроса невозможно
  updateConfirmationStatus() {
    this.isConfirmed = true;
  }

  updateEmailRecoveryData() {
    this.passwordRecoveryCode = uuidv4();
    this.passwordRecoveryCodeExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    this.isPasswordRecoveryConfirmed = false;
  }

  updatePasswordRecoveryInfo() {
    // this.passwordHash = newPasswordHash; // переместим в класс User
    this.isPasswordRecoveryConfirmed = true;
  }

  updateEmailConfirmationInfo() {
    this.isConfirmed = false;
    this.confirmationCode = uuidv4();
    this.confirmationCodeExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
  }
}

export class User {
  userId: string; //PK
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  emailConfirmationId: string;
  emailConfirmation: EmailConfirmation;
  constructor(data: Partial<User>, passwordHash: string) {
    //this.userId = data.userId;
    this.login = data.login;
    this.email = data.email;
    this.passwordHash = passwordHash;
    this.createdAt = new Date().toISOString();
    this.emailConfirmation = new EmailConfirmation();
  }
  updateConfirmationStatus() {
    this.emailConfirmation.updateConfirmationStatus();
  }

  updateEmailRecoveryData() {
    this.emailConfirmation.updateEmailRecoveryData();
  }

  updatePasswordRecoveryInfo(newPasswordHash: string) {
    this.passwordHash = newPasswordHash;
    this.emailConfirmation.updatePasswordRecoveryInfo();
  }

  updateEmailConfirmationInfo() {
    this.emailConfirmation.updateEmailConfirmationInfo();
  }
}
