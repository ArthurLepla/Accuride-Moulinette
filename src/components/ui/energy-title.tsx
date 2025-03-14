import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnergyTitleProps {
  title: string;
  subtitle?: string;
  variant?: "h1" | "h2" | "h3" | "h4";
  align?: "left" | "center" | "right";
  className?: string;
}

const titleVariants = {
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

const subtitleVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.1,
      ease: "easeOut"
    }
  }
};

const variantStyles = {
  h1: "text-4xl font-bold",
  h2: "text-3xl font-semibold",
  h3: "text-2xl font-medium",
  h4: "text-xl font-medium"
};

const alignStyles = {
  left: "text-left",
  center: "text-center",
  right: "text-right"
};

export function EnergyTitle({
  title,
  subtitle,
  variant = "h2",
  align = "left",
  className
}: EnergyTitleProps) {
  const Component = variant;

  return (
    <div className={cn("space-y-2", alignStyles[align], className)}>
      <motion.div
        variants={titleVariants}
        initial="hidden"
        animate="visible"
      >
        <Component className={cn(
          "text-gray-100",
          variantStyles[variant]
        )}>
          {title}
        </Component>
      </motion.div>
      {subtitle && (
        <motion.div
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-gray-400">
            {subtitle}
          </p>
        </motion.div>
      )}
    </div>
  );
} 
 