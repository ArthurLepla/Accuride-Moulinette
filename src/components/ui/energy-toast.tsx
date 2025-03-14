import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface EnergyToastProps {
  children: React.ReactNode;
  variant?: "default" | "glass" | "solid" | "gradient";
  type?: "info" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  animation?: boolean;
  duration?: number;
  easing?: string;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
  autoClose?: number;
  position?: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center";
  style?: React.CSSProperties;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  glass: "bg-white/10 backdrop-blur-lg text-white dark:bg-gray-900/50",
  solid: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 text-white dark:from-gray-900/50 dark:to-gray-900/30"
};

const typeStyles = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
};

const sizeStyles = {
  sm: "p-3 text-sm",
  md: "p-4 text-base",
  lg: "p-5 text-lg"
};

const iconStyles = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6"
};

const defaultIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle
};

const positionStyles = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "top-center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-center": "bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2"
};

const toastVariants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.3
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export function EnergyToast({
  children,
  variant = "default",
  type = "info",
  size = "md",
  animation = true,
  duration = 0.3,
  easing = "easeOut",
  className,
  title,
  description,
  icon,
  onClose,
  closable = false,
  autoClose = 5000,
  position = "top-right",
  style
}: EnergyToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = defaultIcons[type];

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 200);
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={animation ? toastVariants : undefined}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            "fixed z-50 rounded-lg shadow-lg flex items-start gap-3",
            variantStyles[variant],
            typeStyles[type],
            sizeStyles[size],
            positionStyles[position],
            className
          )}
          style={style}
        >
          {icon || <Icon className={cn("flex-shrink-0", iconStyles[size])} />}
          <div className="flex-1">
            {title && (
              <h4 className="font-medium mb-1">{title}</h4>
            )}
            {description ? (
              <p className="text-sm opacity-90">{description}</p>
            ) : (
              children
            )}
          </div>
          {closable && onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 200);
              }}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors"
            >
              <X className={cn("flex-shrink-0", iconStyles[size])} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface EnergyToastContainerProps {
  children: React.ReactNode;
  position?: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center";
  className?: string;
}

export function EnergyToastContainer({
  children,
  position = "top-right",
  className
}: EnergyToastContainerProps) {
  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2",
        position.includes("top") ? "top-0" : "bottom-0",
        position.includes("left") ? "left-0" : position.includes("right") ? "right-0" : "left-1/2 -translate-x-1/2",
        position.includes("center") ? "top-1/2 -translate-y-1/2" : "p-4",
        className
      )}
    >
      {children}
    </div>
  );
} 