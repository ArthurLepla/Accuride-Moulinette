import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnergyPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const buttonVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export function EnergyPagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: EnergyPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;

  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages);
    visiblePages = pages.slice(start, end);
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </motion.div>

      {visiblePages.map((page) => (
        <motion.div
          key={page}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <Button
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className={cn(
              "min-w-[2.5rem]",
              currentPage === page
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-800 border-gray-700 hover:bg-gray-700"
            )}
          >
            {page}
          </Button>
        </motion.div>
      ))}

      <motion.div
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
} 