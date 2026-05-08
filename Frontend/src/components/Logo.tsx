import logoImg from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Logo = ({ size = "lg", className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-16 h-12",
    md: "w-24 h-20",
    lg: "w-32 h-28",
    xl: "w-40 h-36",
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src={logoImg} 
        alt="Campus Commute Connect" 
        className={`${sizeClasses[size]} object-contain`}
      />
      <div className="w-full max-w-[200px] h-[1px] bg-foreground/80 mt-4" />
    </div>
  );
};

export default Logo;
