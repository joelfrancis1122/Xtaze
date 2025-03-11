"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import { LabelList } from "recharts";
import { forgotPassword } from "../../services/userService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    try{
        await forgotPassword(email);
    }catch(error:any){
        toast.error(error.response.data.message)
    }
  };

  return (
    <div className="flex items-center min-h-screen bg-black">
      <div className="max-w-lg w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          Reset Your Password
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Enter your email to receive a password reset link.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium"
            type="submit"
          >
            Send Reset Link
            {/* Could we reuse BottomGradient here? */}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;