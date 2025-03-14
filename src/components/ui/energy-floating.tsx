import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface EnergyFloatingProps {
  children: React.ReactNode;
  content: React.ReactNode;
  type?: "popover" | "tooltip" | "dropdown";
  position?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  trigger?: "hover" | "click";
  animation?: boolean;
  delay?: number;
  className?: string;
  contentClassName?: string;
  variant?: "default" | "glass" | "solid" | "gradient";
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
  interactive?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  portal?: boolean;
  zIndex?: number;
}

const positionVariants = {
  top: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  },
  right: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  },
  bottom: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  left: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  }
};

const variantStyles = {
  default: "bg-white dark:bg-gray-900",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const sizeStyles = {
  sm: "text-sm p-2",
  md: "text-base p-4",
  lg: "text-lg p-6"
};

export function EnergyFloating({
  children,
  content,
  type = "popover",
  position = "bottom",
  align = "center",
  trigger = "hover",
  animation = true,
  delay = 0,
  className,
  contentClassName,
  variant = "default",
  size = "md",
  arrow = true,
  interactive = false,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  portal = true,
  zIndex = 50
}: EnergyFloatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [showTimeout]);

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      const timeout = setTimeout(() => {
        setIsOpen(true);
      }, delay);
      setShowTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
      setIsOpen(false);
    }
  };

  const handleClick = () => {
    if (trigger === "click") {
      setIsOpen(!isOpen);
    }
  };

  const renderContent = () => (
    <motion.div
      initial={animation ? "initial" : false}
      animate={animation ? "animate" : false}
      exit={animation ? "exit" : false}
      variants={positionVariants[position]}
      className={cn(
        "rounded-lg shadow-lg border border-gray-200 dark:border-gray-800",
        variantStyles[variant],
        sizeStyles[size],
        contentClassName
      )}
      style={{ zIndex }}
    >
      {content}
    </motion.div>
  );

  const commonProps = {
    open: isOpen,
    onOpenChange: setIsOpen,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    className: cn("inline-block", className)
  };

  switch (type) {
    case "popover":
      return (
        <Popover {...commonProps}>
          <PopoverTrigger asChild>
            {children}
          </PopoverTrigger>
          <PopoverContent
            side={position}
            align={align}
            className={cn(
              "p-0",
              !portal && "relative"
            )}
            style={{ zIndex }}
          >
            {renderContent()}
          </PopoverContent>
        </Popover>
      );

    case "tooltip":
      return (
        <TooltipProvider>
          <Tooltip {...commonProps}>
            <TooltipTrigger asChild>
              {children}
            </TooltipTrigger>
            <TooltipContent
              side={position}
              align={align}
              className={cn(
                "p-0",
                !portal && "relative"
              )}
              style={{ zIndex }}
            >
              {renderContent()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

    case "dropdown":
      return (
        <DropdownMenu {...commonProps}>
          <DropdownMenuTrigger asChild>
            {children}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={align}
            className={cn(
              "p-0",
              !portal && "relative"
            )}
            style={{ zIndex }}
          >
            {renderContent()}
          </DropdownMenuContent>
        </DropdownMenu>
      );

    default:
      return null;
  }
} 