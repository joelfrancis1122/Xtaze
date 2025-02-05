import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { cn } from "../../lib/utils";
import { IconBrandGoogle, IconEye, IconEyeOff } from "@tabler/icons-react";
import { Select } from "../components/ui/select";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Signup = () => {
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

  const navigate = useNavigate(); // Initialize navigate

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-center" });
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/register", formData);
      toast.success("User registered successfully!", { position: "top-center" });
      console.log(response.data, "this is the data");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message,
        { position: "top-right" }
      );
    }
  };

  // Navigate to login page
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
          {/* Username */}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="Your username" type="text" value={formData.username} onChange={handleChange} required />
          </LabelInputContainer>

          {/* Country, Gender & DOB */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <LabelInputContainer>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" placeholder="Your country" type="text" value={formData.country} onChange={handleChange} required />
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
                  if (value.length <= 4) { // Ensure the input length doesn't exceed 4 digits
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

          {/* Phone */}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" placeholder="+123456789" type="tel" minLength={10} maxLength={10} value={formData.phone} onChange={handleChange} required />
          </LabelInputContainer>

          {/* Email */}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" placeholder="your@email.com" type="email" value={formData.email} onChange={handleChange} required />
          </LabelInputContainer>

          {/* Password & Confirm Password */}
          <LabelInputContainer className="mb-6 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" name="password" placeholder="asd" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-gray-600"
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </LabelInputContainer>

          <LabelInputContainer className="mb-6 relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input id="confirmPassword" name="confirmPassword" placeholder="asd" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2 text-gray-600"
              >
                {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </LabelInputContainer>
          {/* Submit Button */}
          <button className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]" type="submit">
            Sign Up &rarr;
            <BottomGradient />
          </button>

          {/* Divider */}
          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          {/* Social Login */}
          <div className="flex flex-col space-y-4">
            <button className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]" type="button">
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-sm">Sign up with Google</span>
              <BottomGradient />
            </button>
          </div>

          {/* Link to login page */}
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

export default Signup;

/* Helper Components */
const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-red-800 to-transparent" />
  </>
);

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>
);
