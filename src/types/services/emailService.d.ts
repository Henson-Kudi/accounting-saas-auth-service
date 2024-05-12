import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export default interface EmailService {
  sendMail(params: Mail.Options): Promise<SMTPTransport.SentMessageInfo | null>;
  verifyEmail(email: string): boolean;
}
