import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface EnergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  position?: "center" | "top" | "bottom" | "left" | "right";
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
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full"
};

const positionStyles = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-16",
  bottom: "items-end justify-center pb-16",
  left: "items-center justify-start pl-16",
  right: "items-center justify-end pr-16"
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
    opacity: 0,
    ...(position === "center" && { scale: 0.95 }),
    ...(position === "top" && { y: -20 }),
    ...(position === "bottom" && { y: 20 }),
    ...(position === "left" && { x: -20 }),
    ...(position === "right" && { x: 20 })
  }),
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: (position: keyof typeof positionStyles) => ({
    opacity: 0,
    ...(position === "center" && { scale: 0.95 }),
    ...(position === "top" && { y: -20 }),
    ...(position === "bottom" && { y: 20 }),
    ...(position === "left" && { x: -20 }),
    ...(position === "right" && { x: 20 }),
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  })
};

export function EnergyModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  position = "center",
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
}: EnergyModalProps) {
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
          <div
            className={cn(
              "fixed inset-0 flex z-[${zIndex + 1}]",
              positionStyles[position]
            )}
            onKeyDown={handleKeyDown}
          >
            <motion.div
              variants={animation ? contentVariants : undefined}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={position}
              className={cn(
                "w-full rounded-lg shadow-xl",
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
} 