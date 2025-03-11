import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { cn } from "../../../lib/utils";
import { useNavigate } from "react-router-dom";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { saveAdminData } from "../../redux/adminSlice"; // Adjust path
import { RootState } from "../../store/store"; // Adjust path
import { loginAdmin } from "../../services/adminService"; // Adjust path

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("adminToken");
  const role = useSelector((state: RootState) => state.admin.signupData?.role);

  useEffect(() => {
    if (token && role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [token, navigate]);

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
      await loginAdmin(formData.email, formData.password, dispatch);
      toast.success("Admin Login success!", { position: "top-right" });
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Admin login failed", { position: "top-right" });
    }
  };

  return (
    <div className="flex items-center min-h-screen bg-black">
      <div className="max-w-lg w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          Welcome to Xtaze Admin!
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Manage Xtaze and enjoy!
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

          <LabelInputContainer className="mb-6">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium"
            type="submit"
          >
            Log In →
            <BottomGradient />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

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

/* ======= Bottom Gradient ======= */
const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-red-800 to-transparent" />
  </>
);

/* ======= Label Input Container ======= */
const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>
);