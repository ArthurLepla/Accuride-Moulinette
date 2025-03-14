import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";

interface EnergyLayoutProps {
  children: React.ReactNode;
  variant?: "default" | "split" | "grid" | "stack";
  gap?: "sm" | "md" | "lg" | "xl";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
  responsive?: boolean;
  animation?: boolean;
  scrollable?: boolean;
  maxHeight?: string;
  minHeight?: string;
  background?: "none" | "glass" | "solid" | "gradient";
  border?: "none" | "light" | "medium" | "heavy";
  shadow?: "none" | "soft" | "medium" | "hard";
}

const layoutVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const variantStyles = {
  default: "flex flex-col",
  split: "grid grid-cols-1 md:grid-cols-2",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  stack: "flex flex-col space-y-4"
};

const gapStyles = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8"
};

const paddingStyles = {
  none: "",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8"
};

const backgroundStyles = {
  none: "",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-white dark:bg-gray-900",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const borderStyles = {
  none: "",
  light: "border border-gray-200 dark:border-gray-800",
  medium: "border-2 border-gray-300 dark:border-gray-700",
  heavy: "border-4 border-gray-400 dark:border-gray-600"
};

const shadowStyles = {
  none: "",
  soft: "shadow-soft",
  medium: "shadow-md",
  hard: "shadow-hard"
};

export function EnergyLayout({
  children,
  variant = "default",
  gap = "md",
  padding = "md",
  className,
  responsive = true,
  animation = true,
  scrollable = false,
  maxHeight,
  minHeight,
  background = "none",
  border = "none",
  shadow = "none"
}: EnergyLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const layoutContent = (
    <motion.div
      variants={animation ? layoutVariants : undefined}
      initial={animation ? "hidden" : undefined}
      animate={animation ? "visible" : undefined}
      className={cn(
        "relative rounded-lg",
        variantStyles[variant],
        gapStyles[gap],
        paddingStyles[padding],
        backgroundStyles[background],
        borderStyles[border],
        shadowStyles[shadow],
        className
      )}
      style={{
        maxHeight: maxHeight || (scrollable ? "80vh" : undefined),
        minHeight: minHeight || "min-content"
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          key={Math.random()}
          variants={animation ? itemVariants : undefined}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );

  if (scrollable) {
    return (
      <ScrollArea className="h-full w-full">
        {layoutContent}
      </ScrollArea>
    );
  }

  return layoutContent;
} 