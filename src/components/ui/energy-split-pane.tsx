import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { GripVertical } from "lucide-react";

interface EnergySplitPaneProps {
  children: [React.ReactNode, React.ReactNode];
  direction?: "horizontal" | "vertical";
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  className?: string;
  handleClassName?: string;
  handleColor?: string;
  handleSize?: number;
  snapPoints?: number[];
  snapThreshold?: number;
  onResize?: (size: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  variant?: "default" | "glass" | "solid" | "gradient";
  handleStyle?: "icon" | "bar" | "none";
  zIndex?: number;
}

const variantStyles = {
  default: "bg-white dark:bg-gray-900",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

export function EnergySplitPane({
  children,
  direction = "horizontal",
  minSize = 100,
  maxSize = 800,
  defaultSize = 300,
  className,
  handleClassName,
  handleColor = "currentColor",
  handleSize = 20,
  snapPoints = [],
  snapThreshold = 10,
  onResize,
  onResizeStart,
  onResizeEnd,
  variant = "default",
  handleStyle = "icon",
  zIndex = 10
}: EnergySplitPaneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [containerSize, setContainerSize] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const size = useMotionValue(defaultSize);
  const springConfig = { damping: 20, stiffness: 300 };
  const springSize = useSpring(size, springConfig);

  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize(
          direction === "horizontal"
            ? containerRef.current.offsetWidth
            : containerRef.current.offsetHeight
        );
      }
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, [direction]);

  const handleDragStart = () => {
    setIsDragging(true);
    onResizeStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onResizeEnd?.();
  };

  const handleDrag = (event: any, info: any) => {
    const delta = direction === "horizontal" ? info.delta.x : info.delta.y;
    let newSize = size.get() + delta;

    // Snap to points if close enough
    if (snapPoints.length > 0) {
      const closestPoint = snapPoints.reduce((prev, curr) => {
        return Math.abs(curr - newSize) < Math.abs(prev - newSize) ? curr : prev;
      });

      if (Math.abs(closestPoint - newSize) < snapThreshold) {
        newSize = closestPoint;
      }
    }

    // Constrain size
    newSize = Math.min(Math.max(newSize, minSize), maxSize);
    size.set(newSize);
    onResize?.(newSize);
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
      zIndex: zIndex + 1,
      cursor: direction === "horizontal" ? "ew-resize" : "ns-resize"
    };

    if (direction === "horizontal") {
      return {
        ...baseStyle,
        top: 0,
        bottom: 0,
        width: handleSize,
        transform: "translateX(-50%)"
      };
    } else {
      return {
        ...baseStyle,
        left: 0,
        right: 0,
        height: handleSize,
        transform: "translateY(-50%)"
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
            direction === "horizontal" ? "h-full w-1" : "w-full h-1"
          )}
        />
      );
    }
    return <GripVertical size={handleSize * 0.6} />;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex",
        direction === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
    >
      <motion.div
        className={cn("overflow-hidden", variantStyles[variant])}
        style={{
          [direction === "horizontal" ? "width" : "height"]: springSize
        }}
      >
        {children[0]}
      </motion.div>
      <motion.div
        className={cn("cursor-grab active:cursor-grabbing", handleClassName)}
        style={getHandleStyle()}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          left: minSize,
          right: containerSize - minSize
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
      >
        {getHandleContent()}
      </motion.div>
      <motion.div
        className={cn("flex-1 overflow-hidden", variantStyles[variant])}
        style={{
          [direction === "horizontal" ? "width" : "height"]: useTransform(
            springSize,
            (size) => containerSize - size
          )
        }}
      >
        {children[1]}
      </motion.div>
    </div>
  );
} 