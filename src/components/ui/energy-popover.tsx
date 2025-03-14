import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";

interface EnergyPopoverProps {
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
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  arrow?: boolean;
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
  md: "p-3 text-sm",
  lg: "p-4 text-base"
};

const popoverVariants = {
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

export function EnergyPopover({
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
  side = "bottom",
  align = "center",
  defaultOpen,
  open,
  onOpenChange,
  modal = false,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  arrow = true
}: EnergyPopoverProps) {
  return (
    <PopoverPrimitive.Root
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      <PopoverPrimitive.Trigger asChild>
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          className={cn(
            "z-50 overflow-hidden rounded-lg shadow-lg",
            variantStyles[variant],
            colorStyles[color],
            sizeStyles[size],
            contentClassName
          )}
          sideOffset={5}
          onCloseAutoFocus={(e) => {
            if (!closeOnEscape) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            if (!closeOnOutsideClick) {
              e.preventDefault();
            }
          }}
        >
          <motion.div
            variants={animation ? popoverVariants : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {content}
          </motion.div>
          {arrow && (
            <PopoverPrimitive.Arrow
              className={cn(
                "fill-current",
                variantStyles[variant],
                colorStyles[color]
              )}
            />
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
} 