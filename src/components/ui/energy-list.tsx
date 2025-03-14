import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnergyListProps {
  items: React.ReactNode[];
  variant?: "default" | "bordered" | "striped";
  hover?: boolean;
  className?: string;
}

const listVariants = {
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    x: 5,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const variantStyles = {
  default: "divide-y divide-gray-700",
  bordered: "divide-y divide-gray-700 border border-gray-700 rounded-lg",
  striped: "divide-y divide-gray-700 [&>*:nth-child(even)]:bg-gray-800/50"
};

export function EnergyList({
  items,
  variant = "default",
  hover = true,
  className
}: EnergyListProps) {
  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "divide-y divide-gray-700",
        variantStyles[variant],
        className
      )}
    >
      {items.map((item, index) => (
        <motion.div
          key={typeof item === 'string' ? item : `list-item-${index}`}
          variants={itemVariants}
          whileHover={hover ? "hover" : undefined}
          className="p-4 text-gray-300"
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
} 