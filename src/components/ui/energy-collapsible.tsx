import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface EnergyCollapsibleProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "glass" | "solid" | "gradient";
  animation?: boolean;
  duration?: number;
  easing?: string;
  onToggle?: (isOpen: boolean) => void;
}

const variantStyles = {
  default: "bg-white dark:bg-gray-900",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const contentVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
        ease: "easeOut"
      },
      opacity: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.3,
        ease: "easeIn"
      },
      opacity: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }
};

const iconVariants = {
  closed: { rotate: 0 },
  open: { rotate: 90 }
};

export function EnergyCollapsible({
  children,
  title,
  subtitle,
  defaultOpen = false,
  icon,
  className,
  headerClassName,
  contentClassName,
  variant = "default",
  animation = true,
  duration = 0.3,
  easing = "easeOut",
  onToggle
}: EnergyCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggle?.(!isOpen);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 dark:border-gray-800",
        variantStyles[variant],
        className
      )}
    >
      <button
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left",
          headerClassName
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <motion.div
          variants={animation ? iconVariants : undefined}
          animate={isOpen ? "open" : "closed"}
          transition={{
            duration,
            ease: easing
          }}
        >
          <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={animation ? contentVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn("overflow-hidden", contentClassName)}
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 