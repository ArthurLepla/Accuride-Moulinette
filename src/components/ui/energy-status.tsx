import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnergyStatusProps {
  status: "online" | "offline" | "warning" | "error";
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const statusStyles = {
  online: "bg-green-500",
  offline: "bg-gray-500",
  warning: "bg-yellow-500",
  error: "bg-red-500"
};

const sizeStyles = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4"
};

const pulseStyles = {
  online: "animate-pulse",
  offline: "",
  warning: "animate-pulse",
  error: "animate-pulse"
};

export function EnergyStatus({
  status,
  label,
  size = "md",
  className
}: EnergyStatusProps) {
  return (
    <motion.div
      variants={statusVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex items-center gap-2",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full",
          statusStyles[status],
          sizeStyles[size],
          pulseStyles[status]
        )}
      />
      {label && (
        <span className="text-sm text-gray-300">
          {label}
        </span>
      )}
    </motion.div>
  );
} 