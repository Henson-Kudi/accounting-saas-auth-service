export default interface IPasswordService {
  encrypt(string: string): Promise<string>;
  verify(string: string, hash: string): Promise<boolean>;
}
