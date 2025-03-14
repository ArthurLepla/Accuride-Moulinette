import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EnergyToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const toggleVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export function EnergyToggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  className
}: EnergyToggleProps) {
  return (
    <motion.div
      variants={toggleVariants}
      initial="hidden"
      animate="visible"
      className={cn("flex items-center gap-4", className)}
    >
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={cn(
          "data-[state=checked]:bg-blue-500",
          "data-[state=unchecked]:bg-gray-700",
          "data-[state=checked]:hover:bg-blue-600",
          "data-[state=unchecked]:hover:bg-gray-600"
        )}
      />
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <Label
              htmlFor="toggle"
              className="text-sm font-medium text-gray-300"
            >
              {label}
            </Label>
          )}
          {description && (
            <p className="text-sm text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
} 