import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EnergyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "warning" | "error";
  className?: string;
}

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const variantStyles = {
  default: "text-gray-100",
  warning: "text-yellow-500",
  error: "text-red-500"
};

export function EnergyDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  variant = "default",
  className
}: EnergyDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("bg-gray-800 border-gray-700", className)}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={dialogVariants}
        >
          <DialogHeader>
            <DialogTitle className={variantStyles[variant]}>{title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={cn(
                "ml-2",
                variant === "warning" && "bg-yellow-500 hover:bg-yellow-600",
                variant === "error" && "bg-red-500 hover:bg-red-600"
              )}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
} 