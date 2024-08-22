import { PasswordRecoveryUseCase } from '../src/features/auth/application/usecases/password-recovery-usecase';
import { UserRepositorySql } from '../src/features/users/infrastructure/user.repository';
import { EmailService } from '../src/base/adapters/email/email.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../src/features/users/domain/user.orm.entity';
import { UserCreateDto } from '../src/features/users/api/models/input/create-user.input.model';

describe('Auth integration test', () => {
  let passwordRecoveryUseCase: PasswordRecoveryUseCase;
  let userRepository: UserRepositorySql;
  let emailService: EmailService;

  const mockUserRepository = {
    findByLoginOrEmail: jest.fn(),
    save: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordRecoveryEmail: jest.fn(),
  };
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordRecoveryUseCase,
        { provide: UserRepositorySql, useValue: mockUserRepository },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    passwordRecoveryUseCase = module.get<PasswordRecoveryUseCase>(
      PasswordRecoveryUseCase,
    );
    userRepository = module.get<UserRepositorySql>(UserRepositorySql);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should throw an exception if user is not found', async () => {
    mockUserRepository.findByLoginOrEmail.mockResolvedValue(null);

    await expect(
      passwordRecoveryUseCase.execute({ email: 'test@example.com' }),
    ).rejects.toThrow(new HttpException('Email accepted', HttpStatus.OK));
  });

  it('should update user recovery data and send email', async () => {
    const dto: UserCreateDto = {
      login: 'Ezekiel07',
      password: '123456',
      email: 'fixit_montrey@gmail.com',
    };
    const user = User.create(dto, 'hashedPassword');
    jest.spyOn(user, 'updateEmailRecoveryData');

    mockUserRepository.findByLoginOrEmail.mockResolvedValue(user);

    await passwordRecoveryUseCase.execute({ email: 'test@example.com' });

    expect(user.updateEmailRecoveryData).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    expect(mockEmailService.sendPasswordRecoveryEmail).toHaveBeenCalledWith(
      'test@example.com',
      user.emailConfirmation.passwordRecoveryCode,
    );
  });

  it('should handle email service errors', async () => {
    const dto: UserCreateDto = {
      login: 'Ezekiel07',
      password: '123456',
      email: 'fixit_montrey@gmail.com',
    };
    const user = User.create(dto, 'hashedPassword');
    jest.spyOn(user, 'updateEmailRecoveryData');

    mockUserRepository.findByLoginOrEmail.mockResolvedValue(user);
    mockEmailService.sendPasswordRecoveryEmail.mockRejectedValue(
      new Error('Email service error'),
    );

    await expect(
      passwordRecoveryUseCase.execute({ email: 'test@example.com' }),
    ).rejects.toThrow(
      new HttpException(
        'Error sending recovery code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );

    expect(user.updateEmailRecoveryData).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    expect(mockEmailService.sendPasswordRecoveryEmail).toHaveBeenCalledWith(
      'test@example.com',
      user.emailConfirmation.passwordRecoveryCode,
    );
  });
});
