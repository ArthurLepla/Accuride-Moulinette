import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface EnergyAccordionProps {
  items: AccordionItem[];
  defaultOpen?: string;
  variant?: "default" | "glass" | "solid" | "gradient";
  animation?: boolean;
  duration?: number;
  easing?: string;
  onToggle?: (id: string) => void;
  className?: string;
  itemClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
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
  open: { rotate: 180 }
};

export function EnergyAccordion({
  items,
  defaultOpen,
  variant = "default",
  animation = true,
  duration = 0.3,
  easing = "easeOut",
  onToggle,
  className,
  itemClassName,
  headerClassName,
  contentClassName
}: EnergyAccordionProps) {
  const [openId, setOpenId] = useState<string | undefined>(defaultOpen);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? undefined : id);
    onToggle?.(id);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-lg border border-gray-200 dark:border-gray-800",
            variantStyles[variant],
            item.disabled && "opacity-50 cursor-not-allowed",
            item.className,
            itemClassName
          )}
        >
          <button
            onClick={() => !item.disabled && handleToggle(item.id)}
            disabled={item.disabled}
            className={cn(
              "w-full flex items-center justify-between p-4 text-left",
              headerClassName
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon && <div className="flex-shrink-0">{item.icon}</div>}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
            <motion.div
              variants={animation ? iconVariants : undefined}
              animate={openId === item.id ? "open" : "closed"}
              transition={{
                duration,
                ease: easing
              }}
            >
              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openId === item.id && (
              <motion.div
                variants={animation ? contentVariants : undefined}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn("overflow-hidden", contentClassName)}
              >
                <div className="p-4 pt-0">{item.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
} 