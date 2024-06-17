import bcrypt from 'bcrypt';
import IPasswordService from '../../types/services/password.service';

const passwordService: IPasswordService = {
  async encrypt(string: string): Promise<string> {
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);

    const hash = await bcrypt.hash(string, salt);

    return hash;
  },

  async verify(string: string, hash: string): Promise<boolean> {
    const verified = await bcrypt.compare(string, hash);
    return verified;
  },
};

export default passwordService;
