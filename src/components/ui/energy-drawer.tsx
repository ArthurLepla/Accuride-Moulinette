import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface EnergyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "glass" | "solid" | "gradient";
  animation?: boolean;
  duration?: number;
  easing?: string;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  zIndex?: number;
}

const sizeStyles = {
  sm: "w-80",
  md: "w-96",
  lg: "w-[32rem]",
  xl: "w-[40rem]",
  full: "w-full"
};

const positionStyles = {
  left: "left-0 top-0 h-full",
  right: "right-0 top-0 h-full",
  top: "left-0 top-0 w-full",
  bottom: "left-0 bottom-0 w-full"
};

const variantStyles = {
  default: "bg-white dark:bg-gray-900",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const contentVariants = {
  hidden: (position: keyof typeof positionStyles) => ({
    ...(position === "left" && { x: "-100%" }),
    ...(position === "right" && { x: "100%" }),
    ...(position === "top" && { y: "-100%" }),
    ...(position === "bottom" && { y: "100%" }),
    opacity: 0
  }),
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: (position: keyof typeof positionStyles) => ({
    ...(position === "left" && { x: "-100%" }),
    ...(position === "right" && { x: "100%" }),
    ...(position === "top" && { y: "-100%" }),
    ...(position === "bottom" && { y: "100%" }),
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  })
};

export function EnergyDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "right",
  size = "md",
  variant = "default",
  animation = true,
  duration = 0.3,
  easing = "easeOut",
  closeOnOutsideClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  zIndex = 50
}: EnergyDrawerProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && closeOnEscape) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={animation ? overlayVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeOnOutsideClick ? onClose : undefined}
            className={cn(
              "fixed inset-0 bg-black/50 backdrop-blur-sm z-[${zIndex}]",
              overlayClassName
            )}
          />
          <motion.div
            variants={animation ? contentVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={position}
            className={cn(
              "fixed shadow-xl",
              positionStyles[position],
              sizeStyles[size],
              variantStyles[variant],
              className,
              contentClassName
            )}
          >
            {(title || description || showCloseButton) && (
              <div
                className={cn(
                  "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800",
                  headerClassName
                )}
              >
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
            )}
            <div className={cn("p-4", bodyClassName)}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 