import { useState, useRef, type KeyboardEvent } from "react";
import { Input } from "../../components/ui/input";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store"
import { useNavigate,} from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

export default function OTPVerification() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
    const navigate = useNavigate(); 
    const [isResendDisabled, setIsResendDisabled] = useState(false);



    const signupData = useSelector((state: RootState) => state.user.signupData);
 

    // Function to handle OTP resend

    const resendOtp = async () => {
        if (isResendDisabled) {
            toast.info("Please wait before resending OTP.", { position: "top-right" });
            return;
        }
    
        setIsResendDisabled(true); 
        setTimeout(() => setIsResendDisabled(false), 10000); 
    
        try {
            setIsSubmitting(false);
            const response = await axios.post(
                "http://localhost:3000/user/send-otp",
                signupData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
    
            if (response.data.success) {
                toast.success("OTP resent successfully!");
                const otpExpiration = Date.now() + 30000; // 30 seconds
                localStorage.setItem("otpExpirationTime", otpExpiration.toString());
            } else {
                toast.error("Failed to resend OTP. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to resend OTP. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (index: number, value: string) => {
        if (value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to next input if value is entered
            if (value && index < 5) {
                inputRefs[index + 1].current?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const verifyOTP = async () => {
        const otpCode = otp.join("");// string aki

        if (otpCode.length !== 6) {
            toast.error("Please enter the full OTP.");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await axios.post("http://localhost:3000/user/verify-otp", {
                otp: otpCode,
            });
                console.log(response,"from backend response");
                
            if (response.data.success) {
                toast.success("OTP verified successfully!");
                await axios.post(
                    "http://localhost:3000/user/register",
                    signupData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                navigate("/home"); 
            }
      
        } catch (error:any) {
            console.log(error,"error in console");
            
            toast.error(error.response.data.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-semibold">Continue with Xtaze</h1>
                </div>

                <div className="text-sm text-gray-400 text-center">
                    We have sent a code to your registered email. Enter it below.
                </div>

                <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                        <Input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={inputRefs[index]}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-lg bg-zinc-800 border-zinc-700"
                        />
                    ))}
                </div>

            

                <button
                    onClick={verifyOTP}
                    disabled={isSubmitting}
                    className={`w-full py-2 px-4 border border-gray-500 rounded-md text-white ${isSubmitting ? "bg-gray-700 cursor-not-allowed" : "hover:bg-gray-800"
                        }`}
                >
                    {isSubmitting ? "Verifying..." : "SUBMIT"}
                </button>

                <div className="text-center mt-4">
                    
                        <button
                            onClick={resendOtp}
                            className="text-blue-500 hover:underline"
                            disabled={isSubmitting}
                        >
                            Resend OTP
                        </button>
                    
                </div>

                <div className="text-center">
                    <p className="text-neutral-600 dark:text-neutral-300">
                        Already have an account?{" "}
                        <button onClick={() => navigate("/")} className="text-blue-500 hover:underline">
                            Log In
                        </button>
                    </p>
                </div>
            </div>
        </div >
    );
}
