import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface EnergyPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  position?: "center" | "top" | "right" | "bottom" | "left";
  variant?: "default" | "glass" | "solid" | "gradient";
  animation?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  zIndex?: number;
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "w-full h-full"
};

const positionStyles = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-4",
  right: "items-center justify-end pr-4",
  bottom: "items-end justify-center pb-4",
  left: "items-center justify-start pl-4"
};

const variantStyles = {
  default: "bg-white dark:bg-gray-900",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const contentVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 }
};

export function EnergyPortal({
  children,
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  position = "center",
  variant = "default",
  animation = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  contentClassName,
  zIndex = 50
}: EnergyPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (closeOnEscape) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEscape);
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, closeOnEscape, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={animation ? "hidden" : false}
          animate={animation ? "visible" : false}
          exit={animation ? "exit" : false}
          variants={overlayVariants}
          className={cn(
            "fixed inset-0 z-50 flex",
            positionStyles[position],
            overlayClassName
          )}
          onClick={closeOnOutsideClick ? onClose : undefined}
        >
          <motion.div
            initial={animation ? "hidden" : false}
            animate={animation ? "visible" : false}
            exit={animation ? "exit" : false}
            variants={contentVariants}
            className={cn(
              "relative rounded-lg shadow-lg border border-gray-200 dark:border-gray-800",
              sizeStyles[size],
              variantStyles[variant],
              contentClassName
            )}
            style={{ zIndex: zIndex + 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || description) && (
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
            )}
            <div className={cn(
              "p-6",
              !title && !description && "p-0"
            )}>
              {children}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
} 