import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface EnergyTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: "default" | "glass" | "solid" | "gradient";
  animation?: boolean;
  duration?: number;
  easing?: string;
  onChange?: (id: string) => void;
  className?: string;
  tabsClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
  indicatorClassName?: string;
}

const variantStyles = {
  default: "bg-white dark:bg-gray-900",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export function EnergyTabs({
  tabs,
  defaultTab,
  variant = "default",
  animation = true,
  duration = 0.3,
  easing = "easeOut",
  onChange,
  className,
  tabsClassName,
  tabClassName,
  contentClassName,
  indicatorClassName
}: EnergyTabsProps) {
  const [activeTab, setActiveTab] = useState<string | undefined>(defaultTab || tabs[0]?.id);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex border-b border-gray-200 dark:border-gray-800",
          tabsClassName
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              tab.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              tab.className,
              tabClassName
            )}
          >
            {tab.icon && <div className="flex-shrink-0">{tab.icon}</div>}
            <span
              className={cn(
                "transition-colors",
                activeTab === tab.id
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500",
                  indicatorClassName
                )}
                transition={{
                  duration,
                  ease: easing
                }}
              />
            )}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeTab && (
          <motion.div
            key={activeTab}
            variants={animation ? contentVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn("mt-4", contentClassName)}
          >
            {tabs.find((tab) => tab.id === activeTab)?.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 