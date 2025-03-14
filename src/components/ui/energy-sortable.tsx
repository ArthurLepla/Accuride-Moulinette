import { motion, Reorder, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { GripVertical } from "lucide-react";

interface SortableItem {
  id: string;
  content: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface EnergySortableProps {
  items: SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  direction?: "horizontal" | "vertical";
  animation?: boolean;
  dragHandle?: boolean;
  dragHandleSize?: number;
  dragHandleColor?: string;
  className?: string;
  itemClassName?: string;
  handleClassName?: string;
  spacing?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "glass" | "solid" | "gradient";
  disabled?: boolean;
}

const spacingStyles = {
  sm: "gap-1",
  md: "gap-2",
  lg: "gap-4",
  xl: "gap-6"
};

const variantStyles = {
  default: "bg-white dark:bg-gray-900",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  drag: {
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export function EnergySortable({
  items,
  onReorder,
  direction = "vertical",
  animation = true,
  dragHandle = true,
  dragHandleSize = 20,
  dragHandleColor = "currentColor",
  className,
  itemClassName,
  handleClassName,
  spacing = "md",
  variant = "default",
  disabled = false
}: EnergySortableProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const renderDragHandle = () => {
    if (!dragHandle) return null;

    return (
      <motion.div
        className={cn(
          "flex items-center justify-center cursor-grab active:cursor-grabbing",
          handleClassName
        )}
        style={{
          width: dragHandleSize,
          height: dragHandleSize,
          color: dragHandleColor,
          opacity: isDragging ? 1 : 0.5,
          transition: "opacity 0.2s"
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          dragControls.start(e);
        }}
      >
        <GripVertical size={dragHandleSize * 0.6} />
      </motion.div>
    );
  };

  return (
    <Reorder.Group
      axis={direction === "horizontal" ? "x" : "y"}
      values={items}
      onReorder={onReorder}
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        spacingStyles[spacing],
        className
      )}
    >
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          disabled={disabled || item.disabled}
          dragControls={dragControls}
          variants={animation ? itemVariants : undefined}
          initial={animation ? "hidden" : undefined}
          animate={animation ? "visible" : undefined}
          whileDrag={animation ? "drag" : undefined}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            "flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4",
            variantStyles[variant],
            itemClassName
          )}
        >
          {renderDragHandle()}
          <div className="flex-1">{item.content}</div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
} 