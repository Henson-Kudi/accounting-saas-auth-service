import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import environment from '../../utils/environment';

export default async function sendMail(
  params: Mail.Options
): Promise<SMTPTransport.SentMessageInfo | null> {
  try {
    if (!environment.smtp.user || !environment.smtp.pass) {
      throw new Error('Failed to authenticate');
    }
    const transporter = nodemailer.createTransport({
      service: 'GMail',
      auth: {
        user: environment.smtp.user,
        pass: environment.smtp.pass,
      },
    });
    const sent = await transporter.sendMail(params);

    return sent;
  } catch (err) {
    return null;
  }
}
