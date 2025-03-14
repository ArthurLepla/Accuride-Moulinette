import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnergySkeletonProps {
  variant?: "default" | "glass" | "solid" | "gradient";
  animation?: boolean;
  duration?: number;
  easing?: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const variantStyles = {
  default: "bg-gray-200 dark:bg-gray-800",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const shimmerVariants = {
  initial: {
    x: "-100%"
  },
  animate: {
    x: "100%",
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity
    }
  }
};

export function EnergySkeleton({
  variant = "default",
  animation = true,
  duration = 1.5,
  easing = "linear",
  className,
  children
}: EnergySkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        variantStyles[variant],
        className
      )}
    >
      {animation && (
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}
      {children}
    </div>
  );
}

interface EnergySkeletonTextProps extends EnergySkeletonProps {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
}

export function EnergySkeletonText({
  lines = 1,
  lineHeight = 20,
  spacing = 8,
  ...props
}: EnergySkeletonTextProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <EnergySkeleton
          key={index}
          className="h-[20px] w-full"
          {...props}
        />
      ))}
    </div>
  );
}

interface EnergySkeletonAvatarProps extends EnergySkeletonProps {
  size?: "sm" | "md" | "lg";
}

export function EnergySkeletonAvatar({
  size = "md",
  ...props
}: EnergySkeletonAvatarProps) {
  const sizeStyles = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <EnergySkeleton
      className={cn("rounded-full", sizeStyles[size])}
      {...props}
    />
  );
}

interface EnergySkeletonCardProps extends EnergySkeletonProps {
  width?: number;
  height?: number;
}

export function EnergySkeletonCard({
  width = 300,
  height = 200,
  ...props
}: EnergySkeletonCardProps) {
  return (
    <EnergySkeleton
      className="w-full"
      style={{ width, height }}
      {...props}
    >
      <div className="p-4 space-y-4">
        <EnergySkeleton className="h-4 w-3/4" />
        <EnergySkeletonText lines={3} />
      </div>
    </EnergySkeleton>
  );
}

interface EnergySkeletonListProps extends EnergySkeletonProps {
  items?: number;
  itemHeight?: number;
  spacing?: number;
}

export function EnergySkeletonList({
  items = 5,
  itemHeight = 60,
  spacing = 8,
  ...props
}: EnergySkeletonListProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, index) => (
        <EnergySkeleton
          key={index}
          className="w-full"
          style={{ height: itemHeight }}
          {...props}
        />
      ))}
    </div>
  );
} 