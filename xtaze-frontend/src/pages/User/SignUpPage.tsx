import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { cn } from "../../../lib/utils";
import { IconEye, IconEyeOff, IconCheck, IconX } from "@tabler/icons-react";
import { Select } from "../../components/ui/select";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveSignupData } from "../../redux/userSlice";
import { motion } from "framer-motion";
import debounce from "lodash/debounce";
import { checkUsername, sendOtp } from "../../services/userService";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    username: "",
    country: "",
    gender: "",
    year: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "unique" | "taken">("idle");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (!username.trim()) {
        setUsernameStatus("idle");
        return;
      }

      setUsernameStatus("checking");
      try {
        const isAvailable = await checkUsername(username.trim());
        setUsernameStatus(isAvailable ? "unique" : "taken");
      } catch (error: any) {
        console.error("Error checking username:", error);
        setUsernameStatus("taken");
        toast.error(error.message || "Error checking username availability", { position: "top-right" });
      }
    }, 500),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "username") {
      checkUsernameAvailability(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, phone: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast.error("Username cannot be empty or only spaces.");
      return;
    }
    if (!formData.country.trim()) {
      toast.error("Country cannot be empty or only spaces.");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Password cannot be only spaces.");
      return;
    }
    if (isButtonDisabled) {
      toast.info("Please wait before trying again.", { position: "top-right" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-right" });
      return;
    }
    if (usernameStatus !== "unique") {
      toast.error("Please choose a unique username.", { position: "top-right" });
      return;
    }

    setIsButtonDisabled(true);
    setIsLoading(true);
    try {
      await sendOtp(formData.email);
      toast.success("OTP sent successfully!", { position: "top-right" });
      dispatch(saveSignupData(formData));
      navigate("/otp", { state: { otpSent: true } });
    } catch (error: any) {
      toast.error(error.response.data.message || "Error sending OTP", { position: "top-right" });
    } finally {
      setIsLoading(false); // Stop loading
      setIsButtonDisabled(false); // Re-enable button
    }
  };

  const goToLogin = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center min-h-screen bg-black">
      <div className="max-w-lg w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Welcome to Xtaze</h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Join Xtaze and enjoy unlimited music streaming!
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="username">Username</Label>
            <div className="relative flex items-center w-full">
              <Input
                id="username"
                name="username"
                placeholder="Your username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                maxLength={15}
                required
                className="w-full mr-100"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {usernameStatus === "checking" && (
                  <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-gray-400 rounded-full"></span>
                )}
                {usernameStatus === "unique" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IconCheck size={20} className="text-green-500" />
                  </motion.div>
                )}
                {usernameStatus === "taken" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <IconX size={20} className="text-red-500" />
                  </motion.div>
                )}
              </div>
            </div>
          </LabelInputContainer>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <LabelInputContainer>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="Your country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="year">Year of Birth</Label>
              <Input
                id="year"
                name="year"
                placeholder="YYYY"
                type="number"
                value={formData.year}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 4) {
                    handleChange(e);
                  }
                }}
                required
                min="1900"
                max={new Date().getFullYear()}
                step="1"
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="gender">Gender</Label>
              <Select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
                className="border rounded-md p-2"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+123456789"
              type="tel"
              minLength={10}
              maxLength={10}
              value={formData.phone}
              onChange={handlePhoneChange}
              required
            />
          </LabelInputContainer>

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

          <LabelInputContainer className="mb-6 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                placeholder="asd"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-600"
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </LabelInputContainer>

          <LabelInputContainer className="mb-6 relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                placeholder="asd"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2 text-gray-600"
              >
                {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600  dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] flex items-center justify-center"
            type="submit"
            disabled={isButtonDisabled || isLoading}
          >
            {isLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></span>
            ) : (
              "Sign Up →"
            )}
            
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          <div className="mt-4 text-center">
            <p className="text-neutral-600 dark:text-neutral-300">
              Already have an account?{" "}
              <button onClick={goToLogin} className="text-blue-500 hover:underline">
                Log In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-red-800 to-transparent" />
  </>
);

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>
);

export default Signup;