import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface EnergyTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  variant?: "default" | "glass" | "solid" | "gradient";
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "pink";
  size?: "sm" | "md" | "lg";
  animation?: boolean;
  duration?: number;
  easing?: string;
  className?: string;
  contentClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delay?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: React.ReactNode;
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
  sm: "p-2 text-xs",
  md: "p-2.5 text-sm",
  lg: "p-3 text-base"
};

const iconStyles = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5"
};

const tooltipVariants = {
  initial: {
    opacity: 0,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeIn"
    }
  }
};

export function EnergyTooltip({
  children,
  content,
  variant = "default",
  color = "blue",
  size = "md",
  animation = true,
  duration = 0.2,
  easing = "easeOut",
  className,
  contentClassName,
  side = "top",
  align = "center",
  delay = 200,
  defaultOpen,
  open,
  onOpenChange,
  icon
}: EnergyTooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={cn(
              "z-50 overflow-hidden rounded-md shadow-md",
              variantStyles[variant],
              colorStyles[color],
              sizeStyles[size],
              contentClassName
            )}
            sideOffset={5}
          >
            <motion.div
              variants={animation ? tooltipVariants : undefined}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center gap-2"
            >
              {icon || <Info className={cn("flex-shrink-0", iconStyles[size])} />}
              <div className="flex-1">
                {content}
              </div>
            </motion.div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
} 