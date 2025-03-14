import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";

interface EnergyResizableProps {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical" | "both";
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  className?: string;
  handleClassName?: string;
  handleColor?: string;
  handleSize?: number;
  snapPoints?: number[];
  snapThreshold?: number;
  onResize?: (width: number, height: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

export function EnergyResizable({
  children,
  direction = "both",
  minWidth = 100,
  maxWidth = 800,
  minHeight = 100,
  maxHeight = 600,
  defaultWidth = 300,
  defaultHeight = 200,
  className,
  handleClassName,
  handleColor = "currentColor",
  handleSize = 20,
  snapPoints = [],
  snapThreshold = 10,
  onResize,
  onResizeStart,
  onResizeEnd
}: EnergyResizableProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const width = useMotionValue(defaultWidth);
  const height = useMotionValue(defaultHeight);

  const springConfig = { damping: 20, stiffness: 300 };
  const springWidth = useSpring(width, springConfig);
  const springHeight = useSpring(height, springConfig);

  const handleDragStart = () => {
    setIsDragging(true);
    onResizeStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onResizeEnd?.();
  };

  const handleDrag = (event: any, info: any) => {
    const newWidth = Math.min(Math.max(width.get() + info.delta.x, minWidth), maxWidth);
    const newHeight = Math.min(Math.max(height.get() + info.delta.y, minHeight), maxHeight);

    let finalWidth = newWidth;
    let finalHeight = newHeight;

    // Snap to points if close enough
    if (snapPoints.length > 0) {
      const closestWidth = snapPoints.reduce((prev, curr) => {
        return Math.abs(curr - newWidth) < Math.abs(prev - newWidth) ? curr : prev;
      });

      if (Math.abs(closestWidth - newWidth) < snapThreshold) {
        finalWidth = closestWidth;
      }
    }

    width.set(finalWidth);
    height.set(finalHeight);
    onResize?.(finalWidth, finalHeight);
  };

  const handleStyle = {
    position: "absolute" as const,
    right: -handleSize / 2,
    bottom: -handleSize / 2,
    width: handleSize,
    height: handleSize,
    cursor: "nwse-resize",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: handleColor,
    opacity: isDragging ? 1 : 0.5,
    transition: "opacity 0.2s",
    zIndex: 10
  };

  return (
    <motion.div
      className={cn("relative", className)}
      style={{
        width: springWidth,
        height: springHeight
      }}
    >
      {children}
      {(direction === "both" || direction === "horizontal") && (
        <motion.div
          className={cn("absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize", handleClassName)}
          style={{
            opacity: isDragging ? 1 : 0.5,
            transition: "opacity 0.2s"
          }}
        />
      )}
      {(direction === "both" || direction === "vertical") && (
        <motion.div
          className={cn("absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize", handleClassName)}
          style={{
            opacity: isDragging ? 1 : 0.5,
            transition: "opacity 0.2s"
          }}
        />
      )}
      {direction === "both" && (
        <motion.div
          className={cn("absolute", handleClassName)}
          style={handleStyle}
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrag={handleDrag}
        >
          <GripVertical size={handleSize * 0.6} />
        </motion.div>
      )}
    </motion.div>
  );
} 