

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { cn } from "../../../lib/utils";
import { useNavigate } from "react-router-dom";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { loginUser, googleLogin } from "../../services/userService";

declare global {
  interface Window {
    google: any;
  }
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const role = useSelector((state: RootState) => state.user.signupData?.role);

  useEffect(() => {
    if (token && role === "user") {
      navigate("/home", { replace: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: "132673285232-qlck5fpb2ak6n2ge8boj4g509vm7qbqh.apps.googleusercontent.com",
        callback: handleGoogleLogin,
      });
      window.google.accounts.id.renderButton(document.getElementById("googleLoginButton"), {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
      });
    };
    script.onerror = () => console.error("Failed to load GSI script");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [token, role, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(formData.email, formData.password, dispatch);
      toast.success("User Login success!", { position: "top-right" });
      navigate("/home");
    } catch (error: any) {
      toast.warning(error.response?.data?.message || "Login failed", { position: "top-right" });
    }
  };

  const handleGoogleLogin = async (response: any) => {
    const idToken = response.credential;
    try {
      await googleLogin(idToken, dispatch);
      toast.success("Logged in with Google successfully!", { position: "top-right" });
      navigate("/home", { replace: true });
    } catch (error: any) {
      toast.error(error.message, { position: "top-right" });
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="flex items-center min-h-screen bg-black">
      <div className="max-w-lg w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Welcome to Xtaze</h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Log in to enjoy unlimited music streaming!
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              placeholder="your@email.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </LabelInputContainer>

          {/* Forgot Password Link */}
          <div className="mt-2 text-right">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-blue-500 hover:underline text-sm"
            >
              Forgot Password?
            </button>
          </div>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium mt-4"
            type="submit"
          >
            Log In →
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          <div className="flex flex-col space-y-4">
            <div id="googleLoginButton"></div>
            <div className="bg-zinc-900 border border-blue-500 rounded-md p-3 text-center transition-all duration-200 hover:scale-[1.02]">
              <p className="text-neutral-300 text-sm">
                Demo email & pass: <span className="text-blue-400 font-semibold">demo@gmail.com</span> / <span className="text-blue-400 font-semibold">asd!</span>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-neutral-600 dark:text-neutral-300">
              Don’t have an account?{" "}
              <button onClick={goToSignup} className="text-blue-500 hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ======= Password Input Component ======= */
const PasswordInput = ({ id, name, value, onChange }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        required
        className="pr-10"
      />
      <button
        type="button"
        className="absolute right-3 top-2 text-gray-600"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
      </button>
    </div>
  );
};

/* ======= Helper Components ======= */
const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-red-800 to-transparent" />
  </>
);

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>
);

export default Login;