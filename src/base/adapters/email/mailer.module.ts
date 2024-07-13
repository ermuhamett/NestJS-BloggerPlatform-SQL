import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { appSettings } from '../../../settings/app-settings';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'mail.ru',
        auth: {
          user: appSettings.api.SMTP_USER,
          pass: appSettings.api.SMTP_PASSWORD,
        },
        secure: true,
      },
      defaults: {
        from: `BloggerPlatform <${appSettings.api.SMTP_USER}>`,
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})

///TODO надо добавить данный сервис в authController
export class EmailModule {}
