export default interface IOtpService {
    sendOTP(email: string): Promise<string>;
    verifyOTP( otp: string): Promise<boolean>;
    isEmpty(): Promise<boolean>;
  }
  
  