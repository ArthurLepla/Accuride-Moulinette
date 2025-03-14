import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnergyBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "glass" | "solid" | "gradient";
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "pink";
  size?: "sm" | "md" | "lg";
  animation?: boolean;
  duration?: number;
  easing?: string;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
  count?: number;
  maxCount?: number;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  glass: "bg-white/10 backdrop-blur-lg text-white dark:bg-gray-900/50",
  solid: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 text-white dark:from-gray-900/50 dark:to-gray-900/30"
};

const colorStyles = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100"
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base"
};

const dotStyles = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5"
};

const pulseVariants = {
  initial: {
    scale: 1,
    opacity: 1
  },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const countVariants = {
  initial: {
    scale: 1
  },
  animate: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

export function EnergyBadge({
  children,
  variant = "default",
  color = "blue",
  size = "md",
  animation = true,
  duration = 0.3,
  easing = "easeInOut",
  className,
  dot = false,
  pulse = false,
  count,
  maxCount = 99
}: EnergyBadgeProps) {
  const displayCount = count && count > maxCount ? `${maxCount}+` : count;

  return (
    <motion.div
      initial={animation ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration, ease: easing }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        variantStyles[variant],
        colorStyles[color],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <motion.span
          variants={pulse ? pulseVariants : undefined}
          initial="initial"
          animate="animate"
          className={cn("rounded-full", dotStyles[size], colorStyles[color])}
        />
      )}
      {children}
      {displayCount && (
        <motion.span
          variants={countVariants}
          initial="initial"
          animate="animate"
          className="ml-1"
        >
          {displayCount}
        </motion.span>
      )}
    </motion.div>
  );
} 