import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import AuthCard from "@/components/AuthCard";
import GradientButton from "@/components/GradientButton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Success = () => {
  const navigate = useNavigate();
  const { pendingRole, completeSignup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    const success = await completeSignup({});
    setIsLoading(false);

    if (success) {
      // Small delay to ensure AuthContext state updates before navigation triggers route guards
      setTimeout(() => {
        if (pendingRole === "driver") {
          navigate("/driver-home");
        } else {
          navigate("/route-selection");
        }
      }, 100);
    } else {
      toast({
        title: "Sync Error",
        description: "Failed to finalize your account. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  return (
    <MobileLayout>
      <AuthCard>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-8">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            Success!!
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            Congratulations! You have been<br />successfully authenticated.
          </p>

          <GradientButton onClick={handleContinue} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up account...
              </span>
            ) : "Continue"}
          </GradientButton>
        </div>
      </AuthCard>
    </MobileLayout>
  );
};

export default Success;
