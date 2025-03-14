import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface EnergyDropdownProps {
  items: DropdownItem[];
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "glass" | "solid" | "gradient";
  animation?: boolean;
  duration?: number;
  easing?: string;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  arrow?: boolean;
  arrowClassName?: string;
  zIndex?: number;
}

const variantStyles = {
  default: "bg-white dark:bg-gray-900",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const contentVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const iconVariants = {
  closed: { rotate: 0 },
  open: { rotate: 180 }
};

export function EnergyDropdown({
  items,
  label,
  icon,
  variant = "default",
  animation = true,
  duration = 0.2,
  easing = "easeOut",
  closeOnOutsideClick = true,
  closeOnEscape = true,
  className,
  buttonClassName,
  contentClassName,
  itemClassName,
  arrow = true,
  arrowClassName,
  zIndex = 50
}: EnergyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnOutsideClick &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnOutsideClick, closeOnEscape]);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          variantStyles[variant],
          buttonClassName
        )}
      >
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <span className="text-sm font-medium">{label}</span>
        <motion.div
          variants={animation ? iconVariants : undefined}
          animate={isOpen ? "open" : "closed"}
          transition={{
            duration,
            ease: easing
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={animation ? contentVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute top-full left-0 mt-2 w-48 rounded-lg shadow-lg z-[${zIndex}]",
              variantStyles[variant],
              contentClassName
            )}
          >
            <div className="py-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                    item.disabled && "opacity-50 cursor-not-allowed",
                    item.className,
                    itemClassName
                  )}
                >
                  {item.icon && <div className="flex-shrink-0">{item.icon}</div>}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            {arrow && (
              <div
                className={cn(
                  "absolute -top-2 left-4 w-4 h-4 rotate-45",
                  variantStyles[variant],
                  arrowClassName
                )}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 