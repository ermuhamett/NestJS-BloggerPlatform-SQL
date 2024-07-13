import {Injectable} from "@nestjs/common";
import {MailerService} from "@nestjs-modules/mailer";


@Injectable()
export class EmailService{
    constructor(private readonly mailerService: MailerService) {}
    async sendRegistrationEmail(userEmail: string, confirmationCode: string) {
        const emailTemplate = this.getRegistrationMailTemplate(userEmail, confirmationCode);
        return await this.sendEmail(emailTemplate);
    }

    async sendPasswordRecoveryEmail(userEmail: string, recoveryCode: string) {
        const emailTemplate = this.getPasswordRecoveryMailTemplate(userEmail, recoveryCode);
        return await this.sendEmail(emailTemplate);
    }

    private async sendEmail(emailTemplate: any) {
        return await this.mailerService.sendMail(emailTemplate);
    }

    private getRegistrationMailTemplate(userEmail: string, confirmationCode: string) {
        return {
            to: userEmail,
            subject: 'Verify your registration on "BloggerPlatform"',
            html: `<h1>Thanks for your registration on "BloggerPlatform"</h1>
             <p>To finish registration please follow the link:
                 <a href='https://google.com?code=${confirmationCode}'>complete registration</a>
             </p>`,
        };
    }

    private getPasswordRecoveryMailTemplate(userEmail: string, recoveryCode: string) {
        return {
            to: userEmail,
            subject: 'Password recovery for "BloggerPlatform"',
            html: `<h1>Recover your password on "BloggerPlatform"</h1>
             <p>To finish password recovery please follow the link:
                 <a href='https://google.com/password-recovery?recoveryCode=${recoveryCode}'>recover password</a>
             </p>
             <p>
                If you have not registered at "BloggerPlatform" just ignore this message
             </p>`,
        };
    }
}