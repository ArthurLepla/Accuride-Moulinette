import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EnergyDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  className?: string;
}

const datePickerVariants = {
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

export function EnergyDatePicker({
  date,
  onDateChange,
  className
}: EnergyDatePickerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={datePickerVariants}
      className={cn("flex items-center gap-2", className)}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-gray-400"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            className="bg-gray-800"
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </motion.div>
  );
} 