import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnergyCardProps {
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const variantStyles = {
  default: "bg-gray-800 border-gray-700",
  success: "bg-green-500/5 border-green-500/20",
  warning: "bg-yellow-500/5 border-yellow-500/20",
  error: "bg-red-500/5 border-red-500/20"
};

export function EnergyCard({
  title,
  children,
  variant = "default",
  className
}: EnergyCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={cn("rounded-lg border", variantStyles[variant], className)}
    >
      <Card className="bg-transparent border-0">
        {title && (
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-100">
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="text-gray-300">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
} 