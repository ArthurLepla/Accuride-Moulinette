import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "warning" | "error";
}

interface EnergyMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const menuVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
      ease: "easeOut"
    }
  })
};

const variantStyles = {
  default: "text-gray-100 hover:bg-gray-700",
  warning: "text-yellow-500 hover:bg-yellow-500/10",
  error: "text-red-500 hover:bg-red-500/10"
};

export function EnergyMenu({
  trigger,
  items,
  align = "end",
  side = "bottom",
  className
}: EnergyMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        className={cn(
          "bg-gray-800 border-gray-700 p-2",
          className
        )}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={menuVariants}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              custom={index}
              variants={itemVariants}
            >
              <DropdownMenuItem
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  variantStyles[item.variant || "default"]
                )}
              >
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            </motion.div>
          ))}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 