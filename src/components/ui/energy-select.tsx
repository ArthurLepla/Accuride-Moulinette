import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface EnergySelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
}

const selectVariants = {
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

export function EnergySelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner une option",
  label,
  error,
  className
}: EnergySelectProps) {
  return (
    <motion.div
      variants={selectVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-2", className)}
    >
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "w-full bg-gray-800 border-gray-700",
            "text-gray-100 placeholder:text-gray-500",
            "focus:ring-blue-500",
            error && "border-red-500"
          )}
        >
          <SelectValue placeholder={placeholder} />
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn(
                "flex items-center gap-2",
                "text-gray-100 hover:bg-gray-700",
                "focus:bg-gray-700 focus:text-gray-100",
                "cursor-pointer"
              )}
            >
              {option.icon}
              {option.label}
              {value === option.value && (
                <Check className="w-4 h-4 ml-auto text-blue-500" />
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </motion.div>
  );
} 