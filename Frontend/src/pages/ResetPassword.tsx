import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { z } from "zod";
import MobileLayout from "@/components/MobileLayout";
import FormInput from "@/components/FormInput";
import GradientButton from "@/components/GradientButton";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const email = (location.state as any)?.email;

  // Protect route — must arrive here via ForgotPassword OTP flow
  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const validateForm = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    try {
      passwordSchema.parse(newPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        newErrors.newPassword = err.errors[0]?.message;
      }
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reset password");
      }

      toast({
        title: "✅ Password Reset",
        description: "Your password has been successfully reset. Please log in.",
      });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen px-8 py-6">
        <BackButton />
        
        <div className="flex-1 pt-8">
          <h1 className="text-2xl font-bold text-foreground text-center mb-4">
            Set New Password
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Create a new password for <strong>{email}</strong>
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">New Password</label>
              <FormInput
                type="password"
                placeholder="••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                showPasswordToggle
                showLockIcon
                error={errors.newPassword}
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Confirm Password</label>
              <FormInput
                type="password"
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPasswordToggle
                showLockIcon
                error={errors.confirmPassword}
              />
            </div>
          </div>

          <div className="mt-12">
            <GradientButton onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </GradientButton>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ResetPassword;
