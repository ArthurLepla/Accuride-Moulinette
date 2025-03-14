import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { ChevronRight, Check } from "lucide-react";

interface EnergyContextMenuProps {
  children: React.ReactNode;
  items: {
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    disabled?: boolean;
    checked?: boolean;
    onSelect?: () => void;
    items?: {
      label: string;
      icon?: React.ReactNode;
      shortcut?: string;
      disabled?: boolean;
      checked?: boolean;
      onSelect?: () => void;
    }[];
  }[];
  variant?: "default" | "glass" | "solid" | "gradient";
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "pink";
  size?: "sm" | "md" | "lg";
  animation?: boolean;
  duration?: number;
  easing?: string;
  className?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  glass: "bg-white/10 backdrop-blur-lg text-white dark:bg-gray-900/50",
  solid: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 text-white dark:from-gray-900/50 dark:to-gray-900/30"
};

const colorStyles = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100"
};

const sizeStyles = {
  sm: "p-1 text-xs",
  md: "p-1.5 text-sm",
  lg: "p-2 text-base"
};

const itemSizeStyles = {
  sm: "px-2 py-1.5 text-xs",
  md: "px-2.5 py-2 text-sm",
  lg: "px-3 py-2.5 text-base"
};

const contextMenuVariants = {
  initial: {
    opacity: 0,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeIn"
    }
  }
};

export function EnergyContextMenu({
  children,
  items,
  variant = "default",
  color = "blue",
  size = "md",
  animation = true,
  duration = 0.2,
  easing = "easeOut",
  className,
  contentClassName,
  align = "start",
  side = "right",
  closeOnOutsideClick = true,
  closeOnEscape = true
}: EnergyContextMenuProps) {
  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger asChild>
        {children}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-lg shadow-lg",
            variantStyles[variant],
            colorStyles[color],
            sizeStyles[size],
            contentClassName
          )}
          onCloseAutoFocus={(e: Event) => {
            if (!closeOnEscape) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e: Event) => {
            if (!closeOnOutsideClick) {
              e.preventDefault();
            }
          }}
        >
          <motion.div
            variants={animation ? contextMenuVariants : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {items.map((item, index) => (
              <div key={index}>
                {item.items ? (
                  <ContextMenuPrimitive.Sub>
                    <ContextMenuPrimitive.SubTrigger
                      className={cn(
                        "flex w-full items-center justify-between rounded-sm outline-none",
                        itemSizeStyles[size],
                        "hover:bg-white/10 dark:hover:bg-gray-800/50",
                        "focus:bg-white/10 dark:focus:bg-gray-800/50",
                        "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </ContextMenuPrimitive.SubTrigger>
                    <ContextMenuPrimitive.SubContent
                      className={cn(
                        "z-50 min-w-[8rem] overflow-hidden rounded-lg shadow-lg",
                        variantStyles[variant],
                        colorStyles[color],
                        sizeStyles[size]
                      )}
                    >
                      {item.items.map((subItem, subIndex) => (
                        <ContextMenuPrimitive.Item
                          key={subIndex}
                          className={cn(
                            "flex w-full items-center justify-between rounded-sm outline-none",
                            itemSizeStyles[size],
                            "hover:bg-white/10 dark:hover:bg-gray-800/50",
                            "focus:bg-white/10 dark:focus:bg-gray-800/50",
                            "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                          )}
                          disabled={subItem.disabled}
                          onSelect={subItem.onSelect}
                        >
                          <div className="flex items-center gap-2">
                            {subItem.icon}
                            {subItem.label}
                          </div>
                          {subItem.checked && (
                            <Check className="h-4 w-4" />
                          )}
                          {subItem.shortcut && (
                            <span className="ml-2 text-xs opacity-60">
                              {subItem.shortcut}
                            </span>
                          )}
                        </ContextMenuPrimitive.Item>
                      ))}
                    </ContextMenuPrimitive.SubContent>
                  </ContextMenuPrimitive.Sub>
                ) : (
                  <ContextMenuPrimitive.Item
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm outline-none",
                      itemSizeStyles[size],
                      "hover:bg-white/10 dark:hover:bg-gray-800/50",
                      "focus:bg-white/10 dark:focus:bg-gray-800/50",
                      "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                    )}
                    disabled={item.disabled}
                    onSelect={item.onSelect}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </div>
                    {item.checked && (
                      <Check className="h-4 w-4" />
                    )}
                    {item.shortcut && (
                      <span className="ml-2 text-xs opacity-60">
                        {item.shortcut}
                      </span>
                    )}
                  </ContextMenuPrimitive.Item>
                )}
              </div>
            ))}
          </motion.div>
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
} 