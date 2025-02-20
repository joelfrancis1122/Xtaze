import nodemailer from "nodemailer";
import IOtpService from "../../domain/service/IOtpService";
import dotenv from "dotenv";

dotenv.config();

export default class OtpService implements IOtpService {
    private static otpStore: { [otp: string]: string } = {};

    async sendOTP(email: string): Promise<string> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Generated OTP: ${otp} for ${email}`);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}. It is valid for 30 seconds.`,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Before storing:", OtpService.otpStore);

            OtpService.otpStore[otp] = email;
            setTimeout(() => {
                console.log(`OTP ${otp} expired and deleted.`);
                delete OtpService.otpStore[otp];
            }, 30000);

            console.log("Stored OTP:", OtpService.otpStore);
        } catch (error) {
            console.error("Error sending OTP:", error);
            throw new Error("Failed to send OTP email");
        }

        return otp;
    }

    async verifyOTP(otp: string): Promise<boolean> {
        console.log("Verifying OTP...",OtpService.otpStore['otp'],"ithen th",otp);
        
        if (!OtpService.otpStore[otp]) {
            console.log(`No OTP stored for ${otp}. Current otpStore:`, OtpService.otpStore);
            return false;

        }
        
        console.log("Verifying verified...");

        console.log(`OTP ${otp} verified for ${OtpService.otpStore[otp]}`);
        delete OtpService.otpStore[otp];

        return true;
    }

    async isEmpty():Promise<boolean>{
        if(Object.keys(OtpService.otpStore).length==0){
            return true 
        }
        return false
    }
}
