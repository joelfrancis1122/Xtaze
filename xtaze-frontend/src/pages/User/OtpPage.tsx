"use client";
import { useState, useRef, type KeyboardEvent } from "react";
import { Input } from "../../components/ui/input";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { sendOtp, verifyOtp, registerUser } from "../../services/userService";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const navigate = useNavigate();
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const signupData = useSelector((state: RootState) => state.user.signupData);

  const resendOtp = async () => {
    if (isResendDisabled) {
      toast.info("Please wait before resending OTP.", { position: "top-right" });
      return;
    }

    if (!signupData?.email) {
      toast.error("Email is missing. Please try signing up again.");
      navigate("/signup");
      return;
    }

    setIsResendDisabled(true);
    setTimeout(() => setIsResendDisabled(false), 10000);

    try {
      setIsSubmitting(true);
      await sendOtp(signupData.email);
      toast.success("OTP resent successfully!");
      const otpExpiration = Date.now() + 30000;
      localStorage.setItem("otpExpirationTime", otpExpiration.toString());
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
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
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter the full OTP.");
      return;
    }

    if (!signupData) {
      toast.error("Signup data is missing. Please try signing up again.");
      navigate("/signup");
      return;
    }

    // Type assertion or validation could be added here if needed
    try {
      setIsSubmitting(true);
      await verifyOtp(otpCode);
      await registerUser(signupData); // Type matches if userSlice is updated
      toast.success("OTP verified successfully!");
      navigate("/home");
    } catch (error: any) {
      console.log(error, "error in console");
      toast.error(error.message || "Failed to verify OTP.");
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
          className={`w-full py-2 px-4 border border-gray-500 rounded-md text-white ${
            isSubmitting ? "bg-gray-700 cursor-not-allowed" : "hover:bg-gray-800"
          }`}
        >
          {isSubmitting ? "Verifying..." : "SUBMIT"}
        </button>

        <div className="text-center mt-4">
          <button
            onClick={resendOtp}
            className="text-blue-500 hover:underline"
            disabled={isSubmitting || isResendDisabled}
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
    </div>
  );
}