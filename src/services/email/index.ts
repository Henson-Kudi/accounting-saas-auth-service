import Joi from '@hapi/joi';
import EmailService from '../../types/services/emailService';
import sendMail from './sendMail';

const emailService: EmailService = {
  sendMail,
  verifyEmail(email: string): boolean {
    const valid = Joi.string().email().validate(email);

    if (valid.error) {
      return false;
    }

    return true;
  },
};

export default emailService;
