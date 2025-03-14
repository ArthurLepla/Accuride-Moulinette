import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnergyLoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "success" | "warning" | "error";
  className?: string;
}

const sizeStyles = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12"
};

const variantStyles = {
  default: "border-gray-700 border-t-gray-100",
  primary: "border-blue-500/20 border-t-blue-500",
  success: "border-green-500/20 border-t-green-500",
  warning: "border-yellow-500/20 border-t-yellow-500",
  error: "border-red-500/20 border-t-red-500"
};

const spinTransition = {
  repeat: Infinity,
  ease: "linear",
  duration: 1
};

export function EnergyLoading({
  size = "md",
  variant = "default",
  className
}: EnergyLoadingProps) {
  return (
    <motion.div
      className={cn(
        "rounded-full border-2",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      animate={{ rotate: 360 }}
      transition={spinTransition}
    />
  );
} 