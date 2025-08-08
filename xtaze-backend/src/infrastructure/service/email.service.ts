import nodemailer from "nodemailer";
import dotenv from "dotenv";
import IEmailService from "../../domain/service/IEmailService";

dotenv.config();

export default class EmailService implements IEmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(email: string, subject: string, token: string): Promise<void> {
    const baseUrl = process.env.URL 
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    console.log(resetLink)
    await this.transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: subject,
      html: `
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}" target="_blank">Click here to reset your password</a></p>
      `
    });
  }
  
}