export default interface IEmailService {
    sendEmail(email: string, subject: string,token:string): Promise<void>;
  }
  