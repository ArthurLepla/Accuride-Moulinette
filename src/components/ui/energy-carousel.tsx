import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
  id: string;
  content: React.ReactNode;
  className?: string;
}

interface EnergyCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  variant?: "default" | "glass" | "solid" | "gradient";
  animation?: boolean;
  duration?: number;
  easing?: string;
  onChange?: (index: number) => void;
  className?: string;
  containerClassName?: string;
  itemClassName?: string;
  arrowClassName?: string;
  dotClassName?: string;
}

const variantStyles = {
  default: "bg-white dark:bg-gray-900",
  glass: "bg-white/10 backdrop-blur-lg dark:bg-gray-900/50",
  solid: "bg-gray-100 dark:bg-gray-800",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/50 dark:to-gray-900/30"
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function EnergyCarousel({
  items,
  autoPlay = false,
  interval = 5000,
  showArrows = true,
  showDots = true,
  variant = "default",
  animation = true,
  duration = 0.3,
  easing = "easeOut",
  onChange,
  className,
  containerClassName,
  itemClassName,
  arrowClassName,
  dotClassName
}: EnergyCarouselProps) {
  const [[page, direction], setPage] = useState([0, 0]);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setPage(([currentPage]) => [
        (currentPage + 1) % items.length,
        1
      ]);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  const paginate = (newDirection: number) => {
    setPage(([currentPage]) => [
      (currentPage + newDirection + items.length) % items.length,
      newDirection
    ]);
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  useEffect(() => {
    onChange?.(page);
  }, [page, onChange]);

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={animation ? slideVariants : undefined}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          className={cn(
            "absolute w-full",
            variantStyles[variant],
            itemClassName
          )}
        >
          {items[page].content}
        </motion.div>
      </AnimatePresence>

      {showArrows && (
        <>
          <button
            onClick={() => paginate(-1)}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors",
              arrowClassName
            )}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={() => paginate(1)}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors",
              arrowClassName
            )}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setPage([index, index > page ? 1 : -1])}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === page
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/75",
                dotClassName
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
} 