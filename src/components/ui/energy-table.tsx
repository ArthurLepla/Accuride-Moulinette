import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface EnergyTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
}

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  }),
  hover: {
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export function EnergyTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  className
}: EnergyTableProps<T>) {
  return (
    <div className={cn("rounded-lg border border-gray-700", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-800 hover:bg-gray-800">
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className="text-gray-400 font-medium"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <motion.tr
              key={item.id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={index}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "cursor-pointer transition-colors",
                "hover:bg-gray-800/50"
              )}
            >
              {columns.map((column) => (
                <TableCell
                  key={`${item.id}-${String(column.key)}`}
                  className="text-gray-300"
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T])}
                </TableCell>
              ))}
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 