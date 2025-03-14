'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Flame, 
  Droplets, 
  Wind,
  ChevronRight,
  Calendar,
  ChevronDown,
  Home
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import Link from 'next/link';

interface EnergyType {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface TemplateHeaderProps {
  title: string;
  breadcrumb: string[];
  selectedEnergyTypes: string[];
  onEnergyTypeChange: (types: string[]) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  actionButtons?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
    icon?: React.ReactNode;
  }[];
}

const energyTypes: EnergyType[] = [
  {
    key: 'electricity',
    name: 'Électricité',
    icon: <div className="w-2 h-2 rounded-full bg-energy-electric" />,
    color: 'bg-energy-electric',
  },
  {
    key: 'gas',
    name: 'Gaz',
    icon: <div className="w-2 h-2 rounded-full bg-energy-gas" />,
    color: 'bg-energy-gas',
  },
  {
    key: 'water',
    name: 'Eau',
    icon: <div className="w-2 h-2 rounded-full bg-energy-water" />,
    color: 'bg-energy-water',
  },
  {
    key: 'air',
    name: 'Air',
    icon: <div className="w-2 h-2 rounded-full bg-energy-air" />,
    color: 'bg-energy-air',
  },
];

const EnergyTypeButton: React.FC<{
  type: EnergyType;
  isSelected: boolean;
  onClick: () => void;
}> = ({ type, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
      isSelected
        ? "bg-primary text-primary-foreground"
        : "bg-muted hover:bg-muted/80"
    )}
  >
    {type.icon}
    <span className="text-sm font-medium">{type.name}</span>
  </button>
);

export function TemplateHeader({
  title,
  breadcrumb,
  selectedEnergyTypes,
  onEnergyTypeChange,
  dateRange,
  onDateRangeChange,
  actionButtons,
}: TemplateHeaderProps) {
  const handleEnergyTypeToggle = (typeKey: string) => {
    if (selectedEnergyTypes.includes(typeKey)) {
      onEnergyTypeChange(selectedEnergyTypes.filter((t) => t !== typeKey));
    } else {
      onEnergyTypeChange([...selectedEnergyTypes, typeKey]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <Home className="w-4 h-4" />
        </Link>
        {breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={`/${breadcrumb.slice(0, index + 1).join('/')}`}
              className={cn(
                "hover:text-foreground transition-colors",
                index === breadcrumb.length - 1 && "text-foreground font-medium"
              )}
            >
              {item}
            </Link>
          </React.Fragment>
        ))}
      </div>

      {/* Header Content */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="flex items-center gap-2">
            {actionButtons?.map((button, index) => (
              <Button
                key={index}
                variant={button.variant || 'outline'}
                onClick={button.onClick}
                className="flex items-center gap-2"
              >
                {button.icon}
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Energy Type Selector */}
          <div className="flex items-center gap-4">
            {energyTypes.map((type) => (
              <EnergyTypeButton
                key={type.key}
                type={type}
                isSelected={selectedEnergyTypes.includes(type.key)}
                onClick={() => handleEnergyTypeToggle(type.key)}
              />
            ))}
          </div>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "d MMMM yyyy", { locale: fr })} -{" "}
                      {format(dateRange.to, "d MMMM yyyy", { locale: fr })}
                    </>
                  ) : (
                    format(dateRange.from, "d MMMM yyyy", { locale: fr })
                  )
                ) : (
                  <span>Sélectionner une période</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
} 