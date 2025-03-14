import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EnergySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const sliderVariants = {
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

export function EnergySlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  description,
  disabled,
  className
}: EnergySliderProps) {
  return (
    <motion.div
      variants={sliderVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-4", className)}
    >
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <Label className="text-sm font-medium text-gray-300">
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
      <div className="flex items-center gap-4">
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            "flex-1",
            "[&_[role=slider]]:bg-blue-500",
            "[&_[role=slider]]:hover:bg-blue-600",
            "[&_[role=slider]]:focus:ring-blue-500",
            "[&_[role=slider]]:disabled:bg-gray-700",
            "[&_[role=slider]]:disabled:cursor-not-allowed"
          )}
        />
        <span className="min-w-[3rem] text-sm text-gray-300">
          {value}
        </span>
      </div>
    </motion.div>
  );
} 