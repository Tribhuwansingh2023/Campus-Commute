import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import MobileLayout from "@/components/MobileLayout";
import FormInput from "@/components/FormInput";
import GradientButton from "@/components/GradientButton";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const emailSchema = z.string().email("Invalid email address");

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resendCount, setResendCount] = useState(3);
  const [isSending, setIsSending] = useState(false);
  const [fallbackOtp, setFallbackOtp] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Auto-fill OTP inputs from fallback code
  const autoFillOtp = (code: string) => {
    const digits = code.split("").slice(0, 4);
    const filled = [...digits, "", "", "", ""].slice(0, 4);
    setOtp(filled);
    setTimeout(() => {
      const lastIdx = Math.min(digits.length - 1, 3);
      inputRefs.current[lastIdx]?.focus();
    }, 50);
  };

  const handleSendOTP = async () => {
    try {
      emailSchema.parse(email);
      setError("");
      setIsSending(true);
      
      const response = await fetch(`${BACKEND_URL}/user/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }
      const data = await response.json();

      // Show fallback OTP on-screen if SMTP is blocked
      if (data.emailFailed && data.otp) {
        setFallbackOtp(data.otp);
      }
      
      setStep("otp");
      toast({
        title: data.emailFailed ? "Code Generated" : "OTP Sent",
        description: data.emailFailed
          ? "Email blocked — use the code shown below."
          : "A verification code has been sent to your email",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || "Invalid email");
      } else {
        toast({
          title: "Error",
          description: "Failed to send verification code. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 4 digits",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullOtp }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Verification failed");
      }
      navigate("/reset-password", { state: { email } });
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Incorrect OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResend = async () => {
    if (resendCount <= 0) return;
    setIsSending(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/user/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) throw new Error();
      
      const data = await response.json();
      if (data.emailFailed && data.otp) {
        setFallbackOtp(data.otp);
      } else {
        setFallbackOtp(null);
      }
      
      setResendCount(resendCount - 1);
      setOtp(["", "", "", ""]);
      toast({
        title: data.emailFailed ? "New Code Generated" : "OTP Resent",
        description: data.emailFailed
          ? "Email blocked — use the code shown below."
          : "A new verification code has been sent",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to resend code",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen px-8 py-6">
        <BackButton />
        
        <div className="flex-1 pt-8">
          <h1 className="text-2xl font-bold text-foreground text-center mb-4">
            {step === "email" ? "Reset Password" : "Verification Code"}
          </h1>

          {step === "email" ? (
            <>
              <p className="text-muted-foreground text-center mb-8">
                Enter your email to receive a verification code
              </p>
              <FormInput
                placeholder="Enter your Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
              />
              <div className="mt-8">
                <GradientButton onClick={handleSendOTP} disabled={isSending}>
                  {isSending ? "Sending..." : "Send OTP"}
                </GradientButton>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-center mb-4">
                Enter the 4-digit code sent to <strong>{email}</strong>
              </p>

              {/* ── Fallback OTP Banner ── */}
              {fallbackOtp ? (
                <div className="bg-emerald-500/10 border-2 border-emerald-500/50 rounded-2xl p-4 mb-6 text-center">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1 uppercase tracking-wide">
                    📧 Email blocked by network
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">Your verification code is:</p>
                  <div className="text-4xl font-bold font-mono tracking-[0.5em] text-emerald-600 dark:text-emerald-400 mb-3">
                    {fallbackOtp}
                  </div>
                  <button
                    type="button"
                    onClick={() => autoFillOtp(fallbackOtp)}
                    className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    ✓ Auto-fill this code
                  </button>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-6 flex items-start gap-2">
                  <span className="text-amber-500 text-lg leading-none">⚠️</span>
                  <p className="text-xs text-amber-600/90 dark:text-amber-400/90">
                    <strong>Not seeing the email?</strong> Check your <strong>Spam</strong> folder.
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-16 h-16 text-center text-2xl font-semibold bg-background border-2 border-muted rounded-2xl focus:border-primary focus:outline-none transition-colors"
                  />
                ))}
              </div>
              <GradientButton onClick={handleVerifyOTP}>
                Verify
              </GradientButton>
              <p className="text-center text-muted-foreground mt-6">
                Didn't receive code?{" "}
                <button 
                  onClick={handleResend}
                  className="text-foreground font-medium"
                  disabled={resendCount <= 0 || isSending}
                >
                  {isSending ? "Sending..." : `Resend (${resendCount} left)`}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default ForgotPassword;
