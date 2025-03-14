import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnergyProgressProps {
  value: number;
  max?: number;
  variant?: "default" | "glass" | "solid" | "gradient";
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "pink";
  size?: "sm" | "md" | "lg";
  animation?: boolean;
  duration?: number;
  easing?: string;
  showValue?: boolean;
  className?: string;
  barClassName?: string;
  valueClassName?: string;
}

const variantStyles = {
  default: "bg-gray-200 dark:bg-gray-800",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const colorStyles = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500"
};

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3"
};

const valueSizeStyles = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base"
};

export function EnergyProgress({
  value,
  max = 100,
  variant = "default",
  color = "blue",
  size = "md",
  animation = true,
  duration = 0.5,
  easing = "easeOut",
  showValue = false,
  className,
  barClassName,
  valueClassName
}: EnergyProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full",
          variantStyles[variant],
          sizeStyles[size],
          barClassName
        )}
      >
        <motion.div
          initial={animation ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration,
            ease: easing
          }}
          className={cn(
            "h-full rounded-full",
            colorStyles[color],
            barClassName
          )}
        />
        {showValue && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center text-white font-medium",
              valueSizeStyles[size],
              valueClassName
            )}
          >
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    </div>
  );
} 