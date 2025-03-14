import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";

interface EnergyDraggableProps {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical" | "both";
  bounds?: "parent" | "window" | { top: number; right: number; bottom: number; left: number };
  grid?: { x: number; y: number };
  snapPoints?: { x: number; y: number }[];
  snapThreshold?: number;
  dragMomentum?: boolean;
  dragElastic?: number;
  dragConstraints?: { top: number; right: number; bottom: number; left: number };
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrag?: (x: number, y: number) => void;
  className?: string;
  handleClassName?: string;
  handleColor?: string;
  handleSize?: number;
  handlePosition?: "top" | "right" | "bottom" | "left" | "center";
  handleStyle?: "icon" | "bar" | "none";
  zIndex?: number;
}

export function EnergyDraggable({
  children,
  direction = "both",
  bounds,
  grid,
  snapPoints = [],
  snapThreshold = 10,
  dragMomentum = true,
  dragElastic = 0.2,
  dragConstraints,
  onDragStart,
  onDragEnd,
  onDrag,
  className,
  handleClassName,
  handleColor = "currentColor",
  handleSize = 20,
  handlePosition = "center",
  handleStyle = "icon",
  zIndex = 10
}: EnergyDraggableProps) {
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const handleDrag = (event: any, info: any) => {
    let newX = x.get() + info.delta.x;
    let newY = y.get() + info.delta.y;

    // Snap to grid if enabled
    if (grid) {
      newX = Math.round(newX / grid.x) * grid.x;
      newY = Math.round(newY / grid.y) * grid.y;
    }

    // Snap to points if close enough
    if (snapPoints.length > 0) {
      const closestPoint = snapPoints.reduce((prev, curr) => {
        const prevDist = Math.sqrt(
          Math.pow(curr.x - newX, 2) + Math.pow(curr.y - newY, 2)
        );
        const currDist = Math.sqrt(
          Math.pow(prev.x - newX, 2) + Math.pow(prev.y - newY, 2)
        );
        return currDist < prevDist ? curr : prev;
      });

      if (
        Math.sqrt(
          Math.pow(closestPoint.x - newX, 2) + Math.pow(closestPoint.y - newY, 2)
        ) < snapThreshold
      ) {
        newX = closestPoint.x;
        newY = closestPoint.y;
      }
    }

    x.set(newX);
    y.set(newY);
    onDrag?.(newX, newY);
  };

  const getHandleStyle = () => {
    const baseStyle = {
      position: "absolute" as const,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: handleColor,
      opacity: isDragging ? 1 : 0.5,
      transition: "opacity 0.2s",
      zIndex: zIndex + 1
    };

    switch (handlePosition) {
      case "top":
        return {
          ...baseStyle,
          top: -handleSize / 2,
          left: "50%",
          transform: "translateX(-50%)",
          width: handleSize,
          height: handleSize
        };
      case "right":
        return {
          ...baseStyle,
          right: -handleSize / 2,
          top: "50%",
          transform: "translateY(-50%)",
          width: handleSize,
          height: handleSize
        };
      case "bottom":
        return {
          ...baseStyle,
          bottom: -handleSize / 2,
          left: "50%",
          transform: "translateX(-50%)",
          width: handleSize,
          height: handleSize
        };
      case "left":
        return {
          ...baseStyle,
          left: -handleSize / 2,
          top: "50%",
          transform: "translateY(-50%)",
          width: handleSize,
          height: handleSize
        };
      case "center":
      default:
        return {
          ...baseStyle,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: handleSize,
          height: handleSize
        };
    }
  };

  const getHandleContent = () => {
    if (handleStyle === "none") return null;
    if (handleStyle === "bar") {
      return (
        <div
          className={cn(
            "bg-current rounded-full",
            handlePosition === "top" || handlePosition === "bottom"
              ? "w-full h-1"
              : "h-full w-1"
          )}
        />
      );
    }
    return <GripVertical size={handleSize * 0.6} />;
  };

  return (
    <motion.div
      className={cn("relative", className)}
      style={{
        x: springX,
        y: springY
      }}
      drag
      dragMomentum={dragMomentum}
      dragElastic={dragElastic}
      dragConstraints={dragConstraints}
      dragDirectionLock={direction !== "both"}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
    >
      {children}
      <motion.div
        className={cn("cursor-grab active:cursor-grabbing", handleClassName)}
        style={getHandleStyle()}
      >
        {getHandleContent()}
      </motion.div>
    </motion.div>
  );
} 