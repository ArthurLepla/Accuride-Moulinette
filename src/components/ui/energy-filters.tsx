import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface EnergyFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  className?: string;
}

const filterOptions = [
  { label: "Électricité", value: "electricity" },
  { label: "Gaz", value: "gas" },
  { label: "Eau", value: "water" },
  { label: "Air", value: "air" }
];

const filterVariants = {
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

export function EnergyFilters({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  className
}: EnergyFiltersProps) {
  const toggleFilter = (value: string) => {
    if (selectedFilters.includes(value)) {
      onFilterChange(selectedFilters.filter(f => f !== value));
    } else {
      onFilterChange([...selectedFilters, value]);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={filterVariants}
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Badge
            key={option.value}
            variant={selectedFilters.includes(option.value) ? "default" : "outline"}
            className="cursor-pointer hover:bg-gray-700"
            onClick={() => toggleFilter(option.value)}
          >
            {option.label}
          </Badge>
        ))}
      </div>

      {selectedFilters.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Filtres actifs :</span>
          {selectedFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filterOptions.find(f => f.value === filter)?.label}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleFilter(filter)}
              />
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
} 